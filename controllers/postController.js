import { db } from "../connect.js";

import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {
  // console.log("dumaan ditoxxx");
  const userId = req.query.userId;
  // const userId = 15;
  const token = req.cookies.accessToken;
  //   console.log(token);
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // console.log("API userID: " + userId);
    const q =
      userId !== "undefined"
        ? `SELECT u.id AS userID, name, coverPic, profilePic, p.*, COUNT(c.id) AS comment_count
        FROM users u INNER JOIN posts p ON u.id = p.userId
        LEFT JOIN comments c ON p.id = c.postId 
        WHERE p.userId = ?
        GROUP BY u.id, p.id ORDER BY p.createdAt DESC`
        : `SELECT u.id AS userId, name, coverPic, profilePic, p.*, COUNT(c.id) AS comment_count
        FROM users u INNER JOIN posts p ON u.id = p.userId
        LEFT JOIN comments c ON p.id = c.postId GROUP BY
        u.id, p.id ORDER BY p.createdAt DESC`;

    const x =
      userId !== "undefined"
        ? `SELECT p.*, u.id AS userId, name, coverPic, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
        : `SELECT p.*, u.id AS userId, name, coverPic, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
        ORDER BY p.createdAt DESC`;
    // LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?

    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];
    // console.log("values = " + values);

    // const q = `SELECT p.*, u.id AS userId, name, coverPic  FROM posts AS p JOIN users AS u ON (u.id = p.userId) ORDER BY p.createdAt DESC`;
    db.query(q, values, (err, data) => {
      // db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      // console.log(data);
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(502).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};
export const deletePost = (req, res) => {
  // console.log("delete dumaan");
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(503).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post");
    });
  });
};
