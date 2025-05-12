import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOption } from "./auth/[...nextauth]";
import prisma from "@/db";
import { CommentInterface, CommentApiResponse } from "@/interface";

interface CommentResponseType {
  storeId?: string;
  page?: string;
  limit?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommentInterface | CommentApiResponse>
) 
{
  const session = await getServerSession(req, res, authOption);
  const { page = "1", limit = "10" , storeId = "" }: CommentResponseType = req.query
  if (req.method === 'POST') {
    // 댓글 등록
    if(!session?.user) {
    return res.status(401);
    }
    const { storeId, body } : { storeId: number; body: string } = req.body;
    const comment = await prisma.comment.create({
      data: {
        storeId,
        body,
        userId: session?.user.id,
      },
  });
  return res.status(200).json(comment);
  }
  else if (req.method === 'DELETE') {
    // 댓글 삭제
    if(!session?.user) {
      return res.status(401);
    }
    const { id } : { id: number } = req.body;
    const comment = await prisma.comment.delete({
      where: {
        id,
      },
    });
    return res.status(200).json(comment);
  }
  else {
    // 댓글 목록 조회
    const skipPage = (parseInt(page) - 1);
    const count = await prisma.comment.count({
      where: {
        storeId: storeId ? parseInt(storeId) : {},
      },
    
    });
    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        storeId: storeId ? parseInt(storeId) : {},
      },
      skip : skipPage * parseInt(limit),
      take : parseInt(limit),
      include :{
        user: true,
      },
  });
  return res.status(200).json({
    data: comments,
    page: parseInt(page),
    totalPage: Math.ceil(count / parseInt(limit)),
  });
}}
