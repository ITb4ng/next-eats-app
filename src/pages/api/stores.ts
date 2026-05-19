import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth";

import prisma from "@/db";
import { StoreApiResponse, StoreType } from "@/interface";
import { logOperationalError } from "@/lib/opsLogger";

import { authOption } from "./auth/[...nextauth]";

interface ResponseType {
  page?: string;
  limit?: string;
  q?: string;
  district?: string;
  id?: string;
}

const getErrorText = (error: unknown) => {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message.toLowerCase() : "";
  }

  return "";
};

const isDatabaseDelayLikeError = (error: unknown) => {
  const message = getErrorText(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code).toLowerCase()
      : "";

  return (
    code === "p1001" ||
    code === "p1002" ||
    code === "p1017" ||
    code.startsWith("54") ||
    message.includes("can't reach database") ||
    message.includes("database server") ||
    message.includes("connect") ||
    message.includes("timeout") ||
    message.includes("gateway") ||
    message.includes("connection") ||
    message.includes("terminated") ||
    message.includes("supabase") ||
    message.includes("pause")
  );
};

async function getCoordinates(address: string) {
  const headers = {
    Authorization: `KakaoAK ${process.env.KAKAO_CLIENT_ID}`,
  };

  const { data } = await axios.get(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURI(address)}`,
    { headers }
  );

  if (!data.documents || data.documents.length === 0) {
    return { lat: null, lng: null };
  }

  return {
    lat: data.documents[0].y,
    lng: data.documents[0].x,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoreApiResponse | StoreType[] | StoreType | null | { message: string }>
) {
  const { page = "1", limit, q, district, id }: ResponseType = req.query;
  const session = await getServerSession(req, res, authOption);
  const pageNumber = parseInt(page, 10);
  const limitNumber = limit ? parseInt(limit, 10) : undefined;

  try {
    if (req.method === "POST" || req.method === "PUT") {
      if (!session?.user) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      if (session.user.role === "DEMO") {
        return res.status(403).json({
          message: "데모 계정은 맛집 등록과 수정을 할 수 없습니다.",
        });
      }

      const formData = req.body;
      const { lat, lng } = await getCoordinates(formData.address);

      const storeData = {
        ...formData,
        lat: lat !== null ? parseFloat(lat) : null,
        lng: lng !== null ? parseFloat(lng) : null,
      };

      const result =
        req.method === "POST"
          ? await prisma.store.create({ data: storeData })
          : await prisma.store.update({ where: { id: formData.id }, data: storeData });

      return res.status(200).json({
        ...result,
        lat: result.lat ?? undefined,
        lng: result.lng ?? undefined,
      });
    }

    if (req.method === "DELETE") {
      if (!session?.user) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      if (session.user.role === "DEMO") {
        return res.status(403).json({
          message: "데모 계정은 맛집 삭제를 할 수 없습니다.",
        });
      }

      if (!id) {
        return res.status(400).json({ message: "삭제할 맛집 ID가 필요합니다." });
      }

      const result = await prisma.store.delete({
        where: { id: parseInt(id, 10) },
      });

      return res.status(200).json({
        ...result,
        lat: result.lat ?? undefined,
        lng: result.lng ?? undefined,
      });
    }

    if (req.method === "GET") {
      if (id) {
        const store = await prisma.store.findUnique({
          where: { id: parseInt(id, 10) },
          include: {
            likes: session
              ? {
                  where: { userId: session.user.id },
                }
              : undefined,
          },
        });

        return res.status(200).json(
          store
            ? {
                ...store,
                lat: store.lat ?? undefined,
                lng: store.lng ?? undefined,
              }
            : null
        );
      }

      const whereCondition = {
        ...(q && { name: { contains: q } }),
        ...(district && { address: { contains: district } }),
      };

      const [stores, count] = await Promise.all([
        prisma.store.findMany({
          where: whereCondition,
          orderBy: { id: "desc" },
          take: limitNumber,
          skip: limitNumber ? (pageNumber - 1) * limitNumber : undefined,
        }),
        prisma.store.count({ where: whereCondition }),
      ]);

      return res.status(200).json({
        page: pageNumber,
        data: stores.map((store) => ({
          ...store,
          lat: store.lat ?? undefined,
          lng: store.lng ?? undefined,
        })),
        totalCount: count,
        totalPage: limitNumber ? Math.ceil(count / limitNumber) : 1,
      });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    if (isDatabaseDelayLikeError(error)) {
      logOperationalError(
        "DB_STORES_UNAVAILABLE",
        "Store API database dependency is unavailable.",
        error,
        { method: req.method ?? null, route: "/api/stores" }
      );

      return res.status(503).json({
        message: "데이터베이스 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    logOperationalError("STORE_API_ERROR", "Store API request failed.", error, {
      method: req.method ?? null,
      route: "/api/stores",
    });

    return res.status(500).json({ message: "맛집 데이터를 처리하는 중 오류가 발생했습니다." });
  }
}
