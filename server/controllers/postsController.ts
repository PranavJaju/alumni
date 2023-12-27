import express, { Request, Response, query } from "express";
import { QueryResult } from "pg";
const { client } = require("../model/db.ts");

exports.getAllPosts = async (req: Request, res: Response) => {
  try {
    const response = await client.query("SELECT * FROM posts order by DESC created_at");
    res.status(200).json(response.rows);
  } catch (err: any) {
    res.status(401).send(err);
  }
};

exports.getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const response = await client.query(
      "SELECT * FROM posts WHERE posts_id=$1",
      [id]
    );
    // const response = await client.query(`SELECT * FROM posts WHERE id=${id}`);

    res.status(200).json(response.rows);
  } catch (err: any) {
    res.status(401).send(err);
  }
};

exports.deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response: any = await client.query(
      "DELETE FROM posts WHERE posts_id = $1",
      [id]
    );
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(401).json(err);
  }
};

exports.createPost = async (req: Request, res: Response) => {
  try {
    const {
      fk_user,
      fk_domain_id,
      title,
      content,
      link
    } = req.body;

    let query = 'INSERT INTO posts (fk_user, fk_domain_id, title, content, likes, link) VALUES ($1,$2,$3,$4,0,$5)';
    const params = [
      fk_user,
      fk_domain_id,
      title,
      content,
      link
    ]
    const response = await client.query(query, params)
    console.log(response)
    res.status(200).send({ message: 'Post Created' })
  } catch (err: any) {
    console.log(err)
    res.status(401).send(err)
  }
};

exports.updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { flag } = req.body;
    if (flag) {
      const { title, content } = req.body;
      const response: any = await client.query(
        "UPDATE posts SET title = $2, content = $3 WHERE posts_id = $1",
        [id, title, content]
      );
      res.status(200).json({ message: "Post updated successfully!" });
    } else {
      const { count } = req.body;
      const response: any = await client.query(
        "UPDATE posts SET likes = likes + $2 WHERE posts_id = $1",
        [id, count]
      );
      res.status(200).json({ message: "Post updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json(err);
  }
};
exports.showBookmark = async(req:Request,res:Response) =>{
    try{
      const {profile_id } = req.body;
      const query:string = "select * from bookmark_post where fk_user = $1";
      let results: QueryResult = client.query(query,[profile_id]);
      return res.status(201).json(results.rows);
    }
    catch(e){
      return res.status(500).json({error:"Internal Server Error"});
    }
}
exports.bookmarkPost = async (req: Request, res: Response) => {
  const { profile_id, posts_id, action } = req.body;
  try {
    if (action) {
      const bookmarkEntryQuery = `INSERT INTO bookmark_post (fk_user,fk_post) VALUES ($1,$2)`;
      const value = [profile_id, posts_id];
      const status = await client.query(bookmarkEntryQuery, value);
      res.status(200).send("Bookmarked");
      //write query for bookmark post
    } else {
      //write query for un-bookmark
      const bookmarkDeleteQuery = `DELETE FROM bookmark_post WHERE fk_user = $1 AND fk_post = $2`;
      const value = [profile_id, posts_id];
      const status = await client.query(bookmarkDeleteQuery, value);
      res.status(200).send("Un-Bookmarked");
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).send(error);
  }

};
