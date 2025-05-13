import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOption } from "./auth/[...nextauth]";
import prisma from "@/db";
import { CommentInterface, CommentApiResponse } from "@/interface";

// message를 포함하는 응답 타입 정의
interface ApiResponseWithMessage extends CommentApiResponse {
  message?: string;
}

interface CommentResponseType {
  storeId?: string;
  page?: string;
  limit?: string;
  id?: string;
  user? : boolean;
}
interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseWithMessage | CommentInterface |  ErrorResponse > // 응답 타입을 변경
) {
  const session = await getServerSession(req, res, authOption);
  const { id = "", page = "1", limit = "10", storeId = "",user = false }: CommentResponseType = req.query;

  if (req.method === 'POST') {
    // 댓글 등록
    if (!session?.user) {
      return res.status(401).json({message: "로그인이 필요합니다." }); // message 추가
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
      return res.status(500).json({ message: "댓글 등록에 실패했습니다." }); // message 추가
    }
  } else if (req.method === 'DELETE') {
    // 댓글 삭제
    if (!session?.user || !id) {
      return res.status(401).json({ message: "로그인이 필요하거나 댓글 ID가 누락되었습니다." }); // message 추가
    }

    try {
      const comment = await prisma.comment.delete({
        where: {
          id: parseInt(id),
        },
      });
      return res.status(200).json(comment);
    } catch (error) {
      return res.status(500).json({ message: "댓글 삭제에 실패했습니다." }); // message 추가
    }
  } else {
    // 댓글 목록 조회
    const skipPage = (parseInt(page) - 1) * parseInt(limit);
    const count = await prisma.comment.count({
      where: {
        storeId: storeId ? parseInt(storeId) : undefined,
        userId : user ? session?.user.id : {},
      },
    });

    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        storeId: storeId ? parseInt(storeId) : undefined,
        userId : user ? session?.user.id : {},
      },
      skip: skipPage,
      take: parseInt(limit),
      include: {
        user: true,
        store: true,
      },
    });

    return res.status(200).json({
      data: comments.map(comment => ({
        ...comment,
        user: {
          ...comment.user,
          email: comment.user.email || "",
        },
        store: {
          ...comment.store,
          lat: comment.store.lat ? parseFloat(comment.store.lat) : undefined, // string을 number로 변환
          lng: comment.store.lng ? parseFloat(comment.store.lng) : undefined, // string을 number로 변환
        }
      })),
      page: parseInt(page),
      totalPage: Math.ceil(count / parseInt(limit)),
      totalCount: count, // 전체 댓글 개수 추가
    });
  }
}
