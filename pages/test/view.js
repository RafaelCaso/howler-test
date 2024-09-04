import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

const View = () => {
  const [files, setFiles] = useState([]);
  const howlerRefs = useRef([]);
  const [muteStates, setMuteStates] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/files");
        const data = await response.json();

        if (data.success) {
          setFiles(data.files);
          howlerRefs.current = data.files.map(
            (file, index) =>
              new Howl({
                src: [file],
                loop: true,
                volume: 1.0,
                onloaderror: (id, msg) => {
                  console.error("Howl loading error:", msg);
                },
              })
          );
          setMuteStates(
            data.files.reduce((acc, file, index) => {
              acc[index] = false;
              return acc;
            }, {})
          );
        } else {
          alert("Failed to fetch files");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchFiles();

    return () => {
      howlerRefs.current.forEach((howler) => howler.unload());
    };
  }, []);

  const playAll = () => {
    howlerRefs.current.forEach((howler) => howler.play());
  };

  const pauseAll = () => {
    howlerRefs.current.forEach((howler) => howler.pause());
  };

  const toggleMute = (index) => {
    const newMuteStates = { ...muteStates, [index]: !muteStates[index] };
    setMuteStates(newMuteStates);
    howlerRefs.current[index].mute(newMuteStates[index]);
  };

  return (
    <>
      <h1>Files</h1>
      <button onClick={playAll}>Play All</button>
      <button onClick={pauseAll}>Pause All</button>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a href={file} target="_blank" rel="noopener noreferrer">
              {file}
            </a>
            <button onClick={() => toggleMute(index)}>
              {muteStates[index] ? "Unmute" : "Mute"}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default View;
