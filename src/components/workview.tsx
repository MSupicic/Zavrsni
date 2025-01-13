import { useState } from "react";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAllWorks"][number];

export const WorkView = (props: PostWithUser) => {
  const { preth, author } = props;

  // State to toggle comments visibility
  // const [showComments, setShowComments] = useState(false);

  return (
    <div key={preth.id} className="flex gap-3 border-b border-slate-400 p-4">
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
          <Link href={`/post/${preth.id}`}>
            <span className="font-thin">{` · ${dayjs(
              preth.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>

        <div className="text-2xl">
          {preth.slika && (
            <Image
              src={preth.slika}
              alt="Work preview"
              width={300}
              height={200}
              className="rounded-lg"
            />
          )}
        </div>
        <div className="text-2xl">
          <span>Opis: </span>
          {preth.opis}
        </div>

        {/* Toggle Comments Section */}
        {/* <div className="mt-4 flex justify-center">
          <span
            className="cursor-pointer text-blue-500"
            onClick={() => setShowComments((prev) => !prev)}
          >
            {showComments ? "Hide comments" : "Show comments"}
          </span>
        </div> */}

        {/* Conditionally Render Comments */}
        {/* {showComments && (
          <Comments preth={preth} author={author} key={preth.id} />
        )} */}
      </div>
    </div>
  );
};
