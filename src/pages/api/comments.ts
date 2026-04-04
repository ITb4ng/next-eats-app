import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "@/db";
import { CommentApiResponse, CommentInterface } from "@/interface";

import { authOption } from "./auth/[...nextauth]";

interface ApiResponseWithMessage extends CommentApiResponse {
  message?: string;
}

interface CommentResponseType {
  storeId?: string;
  page?: string;
  limit?: string;
  id?: string;
  user?: boolean;
}

interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseWithMessage | CommentInterface | ErrorResponse>
) {
  const session = await getServerSession(req, res, authOption);
  const {
    id = "",
    page = "1",
    limit = "10",
    storeId = "",
    user = false,
  }: CommentResponseType = req.query;

  if (req.method === "POST") {
    if (!session?.user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (session.user.role === "DEMO") {
      return res.status(403).json({ message: "데모 계정은 댓글 작성이 제한됩니다." });
    }

    const { storeId, body }: { storeId: number; body: string } = req.body;

    try {
      const comment = await prisma.comment.create({
        data: {
          storeId,
          body,
          userId: session.user.id,
        },
      });

      return res.status(200).json(comment);
    } catch (error) {
      console.error("Comment create error:", error);
      return res.status(500).json({ message: "댓글 등록에 실패했습니다." });
    }
  }

  if (req.method === "DELETE") {
    if (!session?.user || !id) {
      return res.status(401).json({ message: "로그인이 필요하거나 댓글 ID가 누락되었습니다." });
    }

    if (session.user.role === "DEMO") {
      return res.status(403).json({ message: "데모 계정은 댓글 삭제가 제한됩니다." });
    }

    try {
      const comment = await prisma.comment.delete({
        where: {
          id: parseInt(id, 10),
        },
      });

      return res.status(200).json(comment);
    } catch (error) {
      console.error("Comment delete error:", error);
      return res.status(500).json({ message: "댓글 삭제에 실패했습니다." });
    }
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skipPage = (pageNumber - 1) * limitNumber;

  const whereCondition = {
    storeId: storeId ? parseInt(storeId, 10) : undefined,
    userId: user ? session?.user.id : undefined,
  };

  const count = await prisma.comment.count({
    where: whereCondition,
  });

  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: whereCondition,
    skip: skipPage,
    take: limitNumber,
    include: {
      user: true,
      store: true,
    },
  });

  return res.status(200).json({
    data: comments.map((comment) => ({
      ...comment,
      user: {
        ...comment.user,
        email: comment.user.email || "",
      },
      store: {
        ...comment.store,
        lat: comment.store.lat ?? undefined,
        lng: comment.store.lng ?? undefined,
      },
    })),
    page: pageNumber,
    totalPage: Math.ceil(count / limitNumber),
    totalCount: count,
  });
}
