import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "~/utils/api";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

// const CreatePostWizard = () => {
//   const { user } = useUser();

//   const [input, setInput] = useState("");

//   if (!user) return null;

//   return (
//     <div className="flex w-full gap-3">
//       <UserButton
//         appearance={{
//           elements: {
//             userButtonAvatarBox: {
//               width: 56,
//               height: 56,
//             },
//           },
//         }}
//       />
//       <div>Create Post</div>
//       {/* <input
//         placeholder="Create Post"
//         className="grow bg-transparent outline-none"
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             e.preventDefault();
//             if (input !== "") {
//               mutate({ content: input });
//               console.log("jebenti boga");
//             }
//           }
//         }}
//         disabled={isPosting}
//       /> */}
//       {/* {input !== "" && !isPosting && (
//         <button onClick={() => mutate({ content: input })}>Post</button>
//       )}
//       {isPosting && (
//         <div className="flex items-center justify-center">
//           <LoadingSpinner size={20} />
//         </div>
//       )} */}
//     </div>
//   );
// };

interface FormData {
  content: string;
  trazimUslugu: boolean;
  kategorija: string;
  lokacija: string;
  cijena: number;
}

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
  const [content, setContent] = useState<string>("");
  const [trazimUslugu, setTrazimUslugu] = useState<boolean>(false);
  const [kategorija, setKategorija] = useState<string>("");
  const [lokacija, setLokacija] = useState<string>("");
  const [cijena, setCijena] = useState<number>(0);

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setContent("");
      setTrazimUslugu(false);
      setKategorija("");
      setLokacija("");
      setCijena(0);
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

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm"></div>
      <div className="z-10 w-full max-w-2xl rounded-lg bg-black p-8 shadow-lg">
        <h2 className="text-white-800 mb-4 text-xl font-bold">Create Post</h2>
        <form
          className="text-black"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ content, trazimUslugu, kategorija, lokacija, cijena });
          }}
        >
          <label className="mb-2 block text-white">
            Content:
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
              <option value="postavljanje parketa">Postavljanje parketa</option>
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
              type="number"
              value={cijena}
              onChange={(e) => setCijena(Number(e.target.value))}
              className="w-full rounded border border-gray-300 p-2 text-black"
            />
          </label>
          <div className="flex justify-between text-white">
            <button
              type="submit"
              className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
              onClick={() =>
                mutate({
                  content,
                  trazimUslugu,
                  kategorija,
                  lokacija,
                  cijena,
                })
              }
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

type FeedProps = {
  activeTab: "Tražim" | "Nudim";
};

const Feed = ({ activeTab }: FeedProps) => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {activeTab === "Nudim"
        ? [...data].map(
            (fullPost) =>
              !fullPost.post.trazimUslugu && (
                <PostView {...fullPost} key={fullPost.post.id} />
              )
          )
        : [...data].map(
            (fullPost) =>
              fullPost.post.trazimUslugu && (
                <PostView {...fullPost} key={fullPost.post.id} />
              )
          )}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"Tražim" | "Nudim">("Tražim");

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn ? (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        ) : (
          <CreatePostWizard />
        )}
      </div>
      <div className="flex justify-center space-x-4 px-4 py-2 font-semibold">
        <button
          className={`${
            activeTab === "Tražim"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Tražim")}
        >
          Tražim
        </button>
        <span>/</span>
        <button
          className={`${
            activeTab === "Nudim"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Nudim")}
        >
          Nudim
        </button>
      </div>
      <Feed activeTab={activeTab} />
    </PageLayout>
  );
};

export default Home;
