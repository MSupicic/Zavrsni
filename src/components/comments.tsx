import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api, RouterOutputs } from "~/utils/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

// const { data } = api.profile.getUserByUsername.useQuery({
//     username: searchInput,
//   });
//author.username
// const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
//     userId: props.userId,
//   });

type PostWithUser = RouterOutputs["posts"]["getAllRatings"][number];

export const Comments = (props: PostWithUser) => {
  const { rating, author } = props;

  const { data } = api.posts.getPostsByUserId.useQuery({
    userId: rating.korisnik,
  });

  console.log("data", data);
  //   console.log("aaa", rating.authorId); //trenutni korisnik
  //   console.log("aaa", rating.korisnik);
  //   console.log("bbb", author.id); // profil

  return (
    <div key={rating.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />

      <div className="flex w-full flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username} `}</span>
          </Link>

          <span className="font-thin">{` · ${dayjs().fromNow()}`}</span>
        </div>

        <div className="text-2xl">
          <span>Komentar: </span> {rating.komentar}
        </div>
        <div className="text-2xl">
          <span>Ocjena: </span>
          {rating.ocjena}
        </div>
      </div>
    </div>
  );
};
