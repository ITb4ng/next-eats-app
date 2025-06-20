import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOption } from "./auth/[...nextauth]";
import prisma from "@/db";
import { LikeInterface, LikeApiResponse } from "@/interface";

interface ResponseType {
  storeId?: string;
  page?: string;
  limit?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LikeInterface | LikeApiResponse | { isLiked: boolean } | { message: string }>
) {
  const session = await getServerSession(req, res, authOption);

  if (!session?.user) {
    return res.status(401).end();
  }

  const { storeId, page = "1", limit = "10" } = req.query as ResponseType;

  if (req.method === "POST") {
    const { storeId }: { storeId: number } = req.body;

    const like = await prisma.like.findFirst({
      where: {
        storeId,
        userId: session.user.id,
      },
    });

    if (like) {
      // 좋아요 취소
      await prisma.like.delete({
        where: {
          id: like.id,
        },
      });
      return res.status(200).json({ message: "찜 취소됨" });
    } else {
      // 좋아요 생성
      const newLike = await prisma.like.create({
        data: {
          storeId,
          userId: session.user.id,
        },
      });
      return res.status(201).json({ message: "찜 완료됨" });
    }
  }

  if (req.method === "GET") {
    if (storeId) {
      // 특정 가게 좋아요 여부 조회
      const like = await prisma.like.findFirst({
        where: {
          storeId: parseInt(storeId),
          userId: session.user.id,
        },
      });

      return res.status(200).json({ isLiked: !!like });
    }

    // 좋아요 목록 조회
    const count = await prisma.like.count({
      where: {
        userId: session.user.id,
      },
    });

    const skippage = parseInt(page) - 1;

    const likes = await prisma.like.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        userId: session.user.id,
      },
      include: {
        store: true,
      },
      skip: skippage * parseInt(limit),
      take: parseInt(limit),
    });

    const convertedLikes: LikeInterface[] = likes.map((like) => ({
      ...like,
      store: like.store
        ? {
            ...like.store,
            lat: like.store.lat !== null ? parseFloat(like.store.lat as unknown as string) : undefined,
            lng: like.store.lng !== null ? parseFloat(like.store.lng as unknown as string) : undefined,
          }
        : undefined,
    }));

    return res.status(200).json({
      data: convertedLikes,
      page: parseInt(page),
      totalPage: Math.ceil(count / parseInt(limit)),
      totalCount: count,
    });
  }

  return res.status(405).end();
}
