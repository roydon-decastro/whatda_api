import { db } from "../connect.js";

import jwt from "jsonwebtoken";
import moment from "moment";

export const getFreshPosts = (req, res) => {
  console.log("getFresh");
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
    SELECT p.*, u.id AS userId, u.name, u.profilePic, COUNT(l.id) AS likeCount
        FROM posts AS p
        LEFT JOIN likes AS l ON p.id = l.postId
        LEFT JOIN users AS u ON p.userId = u.id
        WHERE p.createdAt >= CURDATE() - INTERVAL 60 DAY
        GROUP BY p.id
        ORDER BY p.createdAt DESC;
    `;

    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};
