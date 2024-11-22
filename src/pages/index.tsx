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

const Feed = () => {
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
      {[...data].map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>

      <Feed />
      <div className="flex items-center justify-between p-4 text-xl">
        {/* <a href="https://github.com/t3dotgg/chirp">
          <div className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <div>Github</div>
          </div>
        </a> */}
        <span>
          {/* <a href="https://patreon.com/t3dotgg">🐦 Chirp Blue</a> */}
        </span>
      </div>
    </PageLayout>
  );
};

export default Home;
