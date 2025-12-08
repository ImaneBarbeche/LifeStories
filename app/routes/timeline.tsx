import type { Route } from "./+types/home";
import { Link } from "react-router";
import { NodeJS } from 'capacitor-nodejs';
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


// Listens to "msg-from-nodejs" from the Node.js process.
// NodeJS.addListener('msg-from-nodejs', event => {


//   document.body.innerHTML = `
//     <p>
//       <b>Message from Capacitor</b><br>
//       First argument: ${event.args[0]}<br>
//       Second argument: ${event.args[1]}
//     </p>
//   `;
//   console.log(event);
// });

// Waits for the Node.js process to initialize.
// NodeJS.whenReady().then(() => {
//   // Sends a message to the Node.js process.
//   NodeJS.send({
//     eventName: 'msg-from-capacitor',
//     args: ['Hello from Capacitor!'],
//   });
// });

export default function Home() {

const [message, setMessage] = useState('');

  useEffect(() => {
    let listenerHandle: any = null;

    const setupNodeJS = async () => {
      // Add listener for messages from Node.js (await the promise)
      listenerHandle = await NodeJS.addListener('msg-from-nodejs', event => {
        setMessage(event.args[0].toString());
        console.log('[Capacitor] Message from Node.js:', event.args[0]);
      });

      // Wait for Node.js to be ready, then send a message
      await NodeJS.whenReady();
      console.log('[Capacitor] Node.js is ready, sending message...');
      NodeJS.send({
        eventName: 'msg-from-capacitor',
        args: ['Hello from Capacitor!'],
      });
    };

    setupNodeJS();

    // Cleanup listener when component unmounts
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []); // Empty dependency array = run once on mount

  return(
    <>
        <h1>This is TIMELINE 💝</h1>
        <Link to={'/'}>HOME</Link>
        <h2>{message || 'Waiting for Node.js response...'}</h2>
    </>
  );
}
