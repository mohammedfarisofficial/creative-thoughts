import Message from "../components/message";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../utils/firebase";
import { toast } from "react-toastify";
import {
  doc,
  Timestamp,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const Details = () => {
  const router = useRouter();
  const routerData = router.query;
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const submitHandler = async () => {
    if (!auth.currentUser) return router.push("/auth/login");
    if (!message) {
      toast.error("Don't leave an empty message 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
      });
      return;
    }
    const docRef = doc(db, "posts", routerData.id);
    await updateDoc(docRef, {
      comments: arrayUnion({
        message,
        avatar: auth.currentUser.photoURL,
        userName: auth.currentUser.displayName,
        time: Timestamp.now(),
      }),
    });
    setMessage("");
  };
  const getComments = async () => {
    const docRef = doc(db, "posts", routerData.id);
    const unsubscribe = onSnapshot(docRef, (snapshot) =>
      setAllMessages(snapshot.data().comments)
    );
    return unsubscribe;
  };
  useEffect(() => {
    if (!router.isReady) return;
    getComments();
  }, [router.isReady,getComments]);

  return (
    <div>
      <Message {...routerData}></Message>
      <div className="my-4">
        <div className="flex">
          <input
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            placeholder="Send a message 😄"
            className="bg-gray-800 w-full outline-none p-2 text-white text-sm"
          />
          <button
            onClick={submitHandler}
            className="bg-cyan-500 text-white py-2 px-4 text-sm"
          >
            Submit
          </button>
        </div>
        <div className="py-6">
          <h2 className="font-bold">Comments</h2>
          {allMessages?.map((message) => (
            <div className="bg-white p-4 my-4 border-2" key={message.time}>
              <div className="flex items-center gap-2 mb-2">
                <img className="w-10 rounded-full" src={message.avatar} />
                <h2>{message.userName}</h2>
              </div>
              <h2>{message.message}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Details;
