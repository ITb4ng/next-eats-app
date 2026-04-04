import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth";

import prisma from "@/db";
import { StoreApiResponse, StoreType } from "@/interface";

import { authOption } from "./auth/[...nextauth]";

interface ResponseType {
  page?: string;
  limit?: string;
  q?: string;
  district?: string;
  id?: string;
}

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
        return res.status(403).json({ message: "데모 계정은 맛집 등록과 수정이 제한됩니다." });
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
        return res.status(403).json({ message: "데모 계정은 맛집 삭제가 제한됩니다." });
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
    console.error("Store API error:", error);
    return res.status(500).json({ message: "맛집 데이터를 처리하는 중 오류가 발생했습니다." });
  }
}
