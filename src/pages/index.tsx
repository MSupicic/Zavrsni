import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "~/utils/api";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useMemo, useState } from "react";
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

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
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
                Kategorija:
                <select
                  value={kategorija}
                  onChange={(e) => setKategorija(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-black"
                >
                  <option value="">Odaberi kategoriju</option>

                  <option value="elektroinstalacije">
                    Rad s elektroinstalacijama
                  </option>
                  <option value="vodoinstalacije">
                    Vodoinstalaterski radovi
                  </option>
                  <option value="keramika">Keramičarski radovi</option>

                  <option value="popravak kliznih vrata">
                    Postavljanje/popravak vrata
                  </option>
                  <option value="montiranje ograde">Montiranje ograde</option>
                  <option value="krov">Radovi na krovu</option>
                  <option value="parket">Postavljanje parketa</option>
                  <option value="plocice">Postavljanje pločića</option>

                  <option value="klima montaza">
                    Postavljanje/popravak klime
                  </option>

                  <option value="namjestaj">Izrada namještaja</option>
                  <option value="soboslikanje">Soboslikarski radovi</option>
                </select>
              </label>
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
                Vrsta oglasa:
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={trazimUslugu}
                      onChange={() => setTrazimUslugu(true)}
                      className="mr-2"
                    />
                    Tražim uslugu
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!trazimUslugu}
                      onChange={() => setTrazimUslugu(false)}
                      className="mr-2"
                    />
                    Nudim uslugu
                  </label>
                </div>
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

type FeedProps = {
  activeTab: "Tražim" | "Nudim";
};

const Feed = ({ activeTab }: FeedProps) => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  const [kategorijaFilter, setKategorijaFilter] = useState("");
  const [lokacijaFilter, setLokacijaFilter] = useState("");
  const [priceSortDirection, setPriceSortDirection] = useState("asc");

  if (postsLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  let filteredData = data.filter(
    (post) =>
      post.post.kategorija
        .toLowerCase()
        .includes(kategorijaFilter.toLowerCase()) &&
      post.post.lokacija.toLowerCase().startsWith(lokacijaFilter.toLowerCase())
  );

  function extractNumber(inputString: any) {
    const matches = inputString.match(/-?\d+\.?\d*/); // Matches integers and floats, including negative values
    return matches ? parseFloat(matches[0]) : null; // Convert the matched string to a floating point number
  }

  if (priceSortDirection === "asc") {
    filteredData.sort(
      (a, b) =>
        (extractNumber(a.post.cijena) ?? 0) -
        (extractNumber(b.post.cijena) ?? 0)
    );
  } else {
    filteredData.sort(
      (a, b) =>
        (extractNumber(b.post.cijena) ?? 0) -
        (extractNumber(a.post.cijena) ?? 0)
    );
  }

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      <div className="mb-4 rounded-lg bg-slate-900 p-4">
        <div className="mb-3 text-lg font-semibold text-white">Filteri:</div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label className="mr-2 text-white">Kategorija:</label>
            <input
              value={kategorijaFilter}
              onChange={(e) => setKategorijaFilter(e.target.value)}
              className="rounded px-2 py-1 text-black"
            />
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-white">Lokacija:</label>
            <input
              value={lokacijaFilter}
              onChange={(e) => setLokacijaFilter(e.target.value)}
              className="rounded px-2 py-1 text-black"
            />
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-white">Cijena:</label>
            <select
              value={priceSortDirection}
              onChange={(e) => setPriceSortDirection(e.target.value)}
              className="rounded px-2 py-1 text-black"
            >
              <option value="asc">Niža prema višoj</option>
              <option value="desc">Viša prema nižoj</option>
            </select>
          </div>
        </div>
      </div>

      {activeTab === "Nudim"
        ? filteredData.map(
            (fullPost) =>
              !fullPost.post.trazimUslugu && (
                <PostView {...fullPost} key={fullPost.post.id} />
              )
          )
        : filteredData.map(
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
