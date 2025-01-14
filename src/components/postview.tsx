import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  // State to toggle comments visibility
  // const [showComments, setShowComments] = useState(false);

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
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
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>

        <div className="text-2xl">
          <span>Kategorija: </span> {post.kategorija}
        </div>
        <div className="text-2xl">
          <span>Opis: </span>
          {post.content}
        </div>
        <div className="text-2xl">
          <span>Lokacija: </span>
          {post.lokacija}
        </div>
        <div className="text-2xl">
          <span>Cijena: </span>
          {post.cijena}
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

        {/* {showComments && <Comments post={post} author={author} key={post.id} />} */}
      </div>
    </div>
  );
};
