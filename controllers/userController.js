import { db } from "../connect.js";

import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const x = "SELECT * FROM users WHERE id=?";
  const q = `
    SELECT u.*,
       follower_counts.follower_count,
       followed_counts.followed_count,
       post_counts.post_count
    FROM users u
    LEFT JOIN (
        SELECT followedUserId, COUNT(*) AS follower_count
        FROM relationships
        GROUP BY followedUserId
    ) AS follower_counts ON u.id = follower_counts.followedUserId
    LEFT JOIN (
        SELECT followerUserId, COUNT(*) AS followed_count
        FROM relationships
        GROUP BY followerUserId
    ) AS followed_counts ON u.id = followed_counts.followerUserId
    LEFT JOIN (
        SELECT userId, COUNT(*) AS post_count
        FROM posts
        GROUP BY userId
    ) AS post_counts ON u.id = post_counts.userId
    WHERE u.id=?;
    `;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

    db.query(
      q,
      [
        req.body.name,
        req.body.city,
        req.body.website,
        req.body.coverPic,
        req.body.profilePic,
        userInfo.id,
      ],
      (err, data) => {
        if (err) res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Updated!");
        return res.status(403).json("You can update only your post!");
      }
    );
  });
};
