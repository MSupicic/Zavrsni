import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { useState } from "react";

// const ProfileFeed = (props: { userId: string }, feedType: string) => {
//   const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
//     userId: props.userId,
//   });

//   if (isLoading) return <LoadingPage />;

//   if (!data || data.length === 0) return <div>User has not posted</div>;

//   return (
//     <div className="flex flex-col">
//       {data.map((fullPost) => (
//         <PostView {...fullPost} key={fullPost.post.id} />
//       ))}
//     </div>
//   );
// };

const ProfileFeed = (props: { userId: string; feedType: string }) => {
  // Conditionally use the appropriate query based on feedType
  const { data, isLoading } =
    props.feedType === "oglasi"
      ? api.posts.getPostsByUserId.useQuery({ userId: props.userId })
      : api.posts.getWorksByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0)
    return (
      <div>
        {props.feedType === "oglasi"
          ? "User has not posted"
          : "User has no works"}
      </div>
    );

  return (
    <div className="flex flex-col">
      {props.feedType === "oglasi"
        ? data.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))
        : data.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const [activeTabProfile, setActiveTabProfile] = useState<"oglasi" | "radovi">(
    "oglasi"
  );

  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername}</title>
      </Head>
      {/* za uredit profil */}
      {/* <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.externalUsername ?? "unknown"
            }'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? data.externalUsername ?? "unknown"
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        oglasi i radovi
        <ProfileFeed userId={data.id} />
      </PageLayout> */}

      <PageLayout>
        <div className="h-30 relative bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.externalUsername ?? "unknown"
            }'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[58px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[44px]"></div>
        <div className="m-10 p-4 text-2xl font-bold">{`@${
          data.username ?? data.externalUsername ?? "unknown"
        }`}</div>
        <div className="mb-4 w-full border-b border-slate-400" />

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-4">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTabProfile === "oglasi"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTabProfile("oglasi")}
          >
            Oglasi
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTabProfile === "radovi"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTabProfile("radovi")}
          >
            Radovi
          </button>
        </div>
        <br></br>
        {/* Tab Content */}
        <div className="mt-4">
          {activeTabProfile === "oglasi" ? (
            <ProfileFeed userId={data.id} feedType="oglasi" />
          ) : (
            <ProfileFeed userId={data.id} feedType="radovi" />
          )}
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
