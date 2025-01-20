import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { useState } from "react";
import { WorkView } from "~/components/workview";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";

import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
import { Comments } from "~/components/comments";
import { UserButton, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
dayjs.extend(relativeTime);

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
//type PostWithUser = RouterOutputs["posts"]["getAll"][number];

type FormData =
  | {
      content: string;
      trazimUslugu: boolean;
      kategorija: string;
      lokacija: string;
      cijena: string;
    }
  | {
      slika: string;
      opis: string;
    };

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<"Oglas" | "Rad">("Oglas");

  // State for "Oglas"
  const [content, setContent] = useState<string>("");
  const [trazimUslugu, setTrazimUslugu] = useState<boolean>(false);
  const [kategorija, setKategorija] = useState<string>("");
  const [lokacija, setLokacija] = useState<string>("");
  const [cijena, setCijena] = useState<string>("");

  // State for "Rad"
  const [slika, setSlika] = useState<string>("");
  const [opis, setOpis] = useState<string>("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      // Reset fields
      setContent("");
      setTrazimUslugu(false);
      setKategorija("");
      setLokacija("");
      setCijena("");
      setSlika("");
      setOpis("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (activeTab === "Oglas") {
      onSubmit({ content, trazimUslugu, kategorija, lokacija, cijena });
    } else {
      onSubmit({ slika, opis });
    }
  };

  const handleMutation = () => {
    if (activeTab === "Oglas") {
      mutate({
        content,
        trazimUslugu,
        kategorija,
        lokacija,
        cijena,
      });
    } else if (activeTab === "Rad") {
      mutate({
        slika,
        opis,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSlika(base64String);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm"></div>
      <div className="z-10 w-full max-w-2xl rounded-lg bg-black p-8 shadow-lg">
        <h2 className="text-white-800 mb-4 text-xl font-bold">Create Post</h2>

        {/* Tab Buttons */}
        <div className="mb-4 flex border-b border-gray-500">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "Oglas"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Oglas")}
          >
            Oglas
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "Rad"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Rad")}
          >
            Rad
          </button>
        </div>

        {/* Form */}
        <form
          className="text-black"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {activeTab === "Oglas" ? (
            <>
              <label className="mb-2 block text-white">
                Opis:
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-black-300 w-full rounded border p-2 text-black"
                />
              </label>
              <label className="mb-2 block text-white">
                Trazim Uslugu:
                <input
                  type="checkbox"
                  checked={trazimUslugu}
                  onChange={(e) => setTrazimUslugu(e.target.checked)}
                  className="ml-2 text-black"
                />
              </label>
              <label className="mb-2 block text-white">
                Kategorija:
                <select
                  value={kategorija}
                  onChange={(e) => setKategorija(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                >
                  <option value="">Select a Category</option>
                  <option value="vodovodna instalacija">
                    Vodovodna instalacija
                  </option>
                  <option value="elektrika">Elektrika</option>
                  <option value="postavljanje parketa">
                    Postavljanje parketa
                  </option>
                  <option value="ostalo">Ostalo</option>
                </select>
              </label>
              <label className="mb-2 block text-white">
                Lokacija:
                <input
                  type="text"
                  value={lokacija}
                  onChange={(e) => setLokacija(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                />
              </label>
              <label className="mb-2 block text-white">
                Cijena:
                <input
                  type="text"
                  value={cijena}
                  onChange={(e) => setCijena(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                />
              </label>
            </>
          ) : (
            <>
              <label className="mb-2 block text-white">
                Slika:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                />
                {selectedFile && (
                  <div className="mt-2">
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded"
                    />
                  </div>
                )}
              </label>
              <label className="mb-2 block text-white">
                Opis:
                <textarea
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                />
              </label>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-between text-white">
            <button
              type="submit"
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={() => handleMutation()}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreatePostWizard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { user } = useUser();

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (formData: FormData) => {
    console.log("Form Data:", formData);
    setModalOpen(false);
    // Here you would handle the submission e.g., sending to an API
  };

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: 56,
              height: 56,
            },
          },
        }}
      />
      <div onClick={() => setModalOpen(true)} style={{ cursor: "pointer" }}>
        Create Post
      </div>
      <CreatePostModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

type rating = {
  ocjena: number;
  komentar: string;
  korisnik: string;
};

interface CreateRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: rating) => void;
  korisnik: string; // Accept korisnik as a prop
}

const CreateRatingModal: React.FC<CreateRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  korisnik, // Destructure korisnik
}) => {
  const [komentar, setKomentar] = useState<string>("");
  const [ocjena, setOcjena] = useState<number>(0);

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setKomentar("");
      setOcjena(0);
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ ocjena, komentar, korisnik }); // Use korisnik in the rating
  };

  const handleMutation = () => {
    mutate({
      ocjena,
      komentar,
      korisnik, // Use korisnik for mutation
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm"></div>
      <div className="z-10 w-full max-w-2xl rounded-lg bg-black p-8 shadow-lg">
        <h2 className="text-white-800 mb-4 text-xl font-bold">Create Rating</h2>
        <form
          className="text-black"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <label className="mb-2 block text-white">
            Komentar:
            <input
              type="text"
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-black"
            />
          </label>
          <label className="mb-2 block text-white">
            Ocjena:
            <input
              type="number"
              value={ocjena}
              onChange={(e) => setOcjena(Number(e.target.value))}
              className="w-full rounded border border-gray-300 p-2 text-black"
            />
          </label>

          {/* Buttons */}
          <div className="flex justify-between text-white">
            <button
              type="submit"
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={() => handleMutation()}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-500 py-2 px-4 font-bold text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateRatingWizardProps {
  korisnik: string; // Accepts `korisnik` as a prop
}

const CreateRatingWizard: React.FC<CreateRatingWizardProps> = ({
  korisnik,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { user } = useUser();

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (rating: rating) => {
    console.log("Data:", rating);
    setModalOpen(false);
  };

  if (!user) return null;

  return (
    <div
      className="flex w-full gap-3"
      style={{ margin: "5px", padding: "5px" }}
    >
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: 56,
              height: 56,
            },
          },
        }}
      />
      <div
        onClick={() => setModalOpen(true)}
        style={{ cursor: "pointer", margin: "2px", padding: "2px" }}
      >
        Create Rating
      </div>
      <CreateRatingModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        korisnik={korisnik} // Pass korisnik to the modal
      />
    </div>
  );
};

const ProfileFeed = (props: { userId: string; feedType: string }) => {
  const { data, isLoading } =
    props.feedType === "oglasi"
      ? api.posts.getPostsByUserId.useQuery({ userId: props.userId })
      : props.feedType === "radovi"
      ? api.posts.getWorksByUserId.useQuery({ userId: props.userId })
      : api.posts.getRatingsByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />;

  // if (!data || data.length === 0)
  //   return (
  //     <div>
  //       {props.feedType === "oglasi"
  //         ? "User has not posted"
  //         : props.feedType === "radovi"
  //         ? "User has no works"
  //         : "User has no ratings"}
  //     </div>
  //   );

  return (
    <div className="flex flex-col border-x border-slate-400">
      {props.feedType === "oglasi"
        ? data?.map((fullPost) =>
            "post" in fullPost ? (
              <PostView {...fullPost} key={fullPost.post.id} />
            ) : null
          )
        : props.feedType === "radovi"
        ? data?.map((fullPost) =>
            "preth" in fullPost ? (
              <WorkView {...fullPost} key={fullPost.preth.id} />
            ) : null
          )
        : data?.map((fullPost) =>
            "rating" in fullPost ? (
              <Comments {...fullPost} key={fullPost.rating.id} />
            ) : null
          )}
    </div>
  );
};
const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const [activeTabProfile, setActiveTabProfile] = useState<
    "oglasi" | "radovi" | "ocjene"
  >("oglasi");

  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername}</title>
      </Head>

      <PageLayout>
        <div className="h-30 relative bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.externalUsername ?? "unknown"
            }'s profile pic`}
            width={110}
            height={110}
            className="absolute bottom-0 left-0 -mb-[58px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[44px]"></div>
        <div className="m-10 p-4">
          <div className="text-2xl font-bold">{`${
            data.username ?? data.externalUsername ?? "unknown"
          }`}</div>
          {data.email && (
            <div className="mt-2 text-slate-400">Kontakt: {data.email}</div>
          )}
        </div>
        <div className="">
          {activeTabProfile === "ocjene" && (
            <CreateRatingWizard korisnik={data.id ?? "unknown"} />
          )}
        </div>
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
          <button
            className={`px-4 py-2 font-semibold ${
              activeTabProfile === "ocjene"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTabProfile("ocjene")}
          >
            Ocjene
          </button>
        </div>
        <br></br>
        {/* Tab Content */}
        <div className="mt-4">
          {activeTabProfile === "oglasi" ? (
            <ProfileFeed userId={data.id} feedType="oglasi" />
          ) : activeTabProfile === "radovi" ? (
            <ProfileFeed userId={data.id} feedType="radovi" />
          ) : (
            <ProfileFeed userId={data.id} feedType="ocjene" />
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
