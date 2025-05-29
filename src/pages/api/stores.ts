import type { NextApiRequest, NextApiResponse } from "next";
import { StoreApiResponse, StoreType } from "@/interface";
import prisma from "@/db";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOption } from "./auth/[...nextauth]";

interface Responsetype {
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
  res: NextApiResponse<StoreApiResponse | StoreType[] | StoreType | null>
) {
  const { page = "1", limit, q, district, id }: Responsetype = req.query;
  const session = await getServerSession(req, res, authOption);
  const pageNumber = parseInt(page || "1");
  const limitNumber = limit ? parseInt(limit) : undefined;

  try {
    if (req.method === "POST" || req.method === "PUT") {
      const formData = req.body;
      const { lat, lng } = await getCoordinates(formData.address);

      const storeData = {
        ...formData,
       lat: lat !== null ? parseFloat(lat) : null,
       lng: lng !== null ? parseFloat(lng) : null,
      };

      const result = req.method === "POST"
        ? await prisma.store.create({ data: storeData })
        : await prisma.store.update({ where: { id: formData.id }, data: storeData });

      return res.status(200).json({
        ...result,
        lat: result.lat ?? undefined,
        lng: result.lng ?? undefined,
      });
    }

    if (req.method === "DELETE") {
      if (!id) return res.status(400).json(null);

      const result = await prisma.store.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({
        ...result,
         lat: result.lat ?? undefined,
         lng: result.lng ?? undefined,
      });
    }

    if (req.method === "GET") {
      // 단일 조회
      if (id) {
        const store = await prisma.store.findUnique({
          where: { id: parseInt(id) },
          include: {
            likes: session ? {
              where: { userId: session.user.id },
            } : undefined,
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

      // 리스트 조회
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
    console.error("API Error:", error);
    return res.status(500).json(null);
  }
}
