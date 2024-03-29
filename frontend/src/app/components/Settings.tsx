"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import axios from "axios";

import Map from "./Map";
import Detail from "./Detail";
import CalculateDisplacement from "./CalculateDisplacement";

interface Point {
  pointId: number;
  name: string;
  E: number;
  N: number;
  H: number;
}

interface Session {
  sessionId: number;
  sessionName: string;
  datetime: string;
  points: Point[];
}

const Settings = ({ userName }: { userName: string }) => {
  // handling klick outside the modal
  const handleOutsideClick = (e: any) => {
    if (e.target.id == "modal") {
      setNewProj(false);
      setOpenProj(false);
      setNewSession(false);
    }
  };

  const [project, setProject] = useState("nicht gewählt");

  // create new project functionalities
  const [newProj, setNewProj] = useState(false);
  const [newProjectError, setNewProjectError] = useState("");

  function changeNewProj() {
    setNewProj(!newProj);
  }

  const handleNewProjectSubmit = async (e: any) => {
    e.preventDefault();
    const projectname = e.target[0].value;
    const customer = e.target[1].value;

    try {
      const response = await axios.post("http://localhost:8000/newProject/", {
        projectName: projectname,
        userEmail: userName,
        clientEmail: customer,
      });

      if (response.data.created == "true") {
        setNewProjectError("");
        setProject(projectname);
        setTimeout(() => {
          changeNewProj();
        }, 100);
      } else if (response.data.created == "CNF") {
        setNewProjectError("Kunde wurde nicht gefunden");
      } else if (response.data.created == "PAEX") {
        setNewProjectError("Projektname bereits vergeben");
      } else {
        setNewProjectError("Fehler, bitte erneut versuchen!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Open Project functionalities
  const [openProj, setOpenProj] = useState(false);

  const [userProjects, setUserProjects] = useState([]);
  const [userId, setuserId] = useState();

  function changeOpenProj() {
    setOpenProj(!openProj);
  }

  const handleOpenProjects = async () => {
    changeOpenProj();

    try {
      const response = await axios.post("http://localhost:8000/openProject/", {
        email: userName,
        password: "a",
      });

      if (response.data.exec == "error") {
        setUserProjects([]);
      } else {
        setUserProjects(response.data.exec);
        setuserId(response.data.userId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get Session functionalities

  const [getSessionerror, setGetSessionerror] = useState("");
  const [sessionData, setSessionData] = useState([
    {
      sessionId: 1,
      sessionName: "session0",
      datetime: "2024-02-29T11:17",
      points: [],
    },
  ]);

  const loadSessionsInProject = async (loadP: string) => {
    try {
      const response = await axios.post("http://localhost:8000/getSessions/", {
        projectName: loadP,
        user: userId,
      });

      if (response.data.message !== "success") {
        setGetSessionerror("An error occured!");
      } else {
        setSessionData(response.data.sessions);
        setGetSessionerror("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadProject = async (loadP: any) => {
    setProject(loadP);
    loadSessionsInProject(loadP);
    setOpenProj(false);
  };

  // capture new session functinalities
  const [newSession, setNewSession] = useState(false);
  const [newSessionError, setNewSessionError] = useState("");

  function changeNewSession() {
    setNewSession(!newSession);
  }

  const handleCreateSessionSubmit = async (e: any) => {
    e.preventDefault();

    const fileInput = e.target[0];
    const datetimeOfMeas = e.target[1].value;
    const file = fileInput.files[0];
    const fileName = fileInput.files[0].name;

    const dotIndex = fileName.lastIndexOf(".");
    const fileNameWithoutExtension =
      dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("username", userName); // Hinzugefügt
      formData.append("projectName", project); // Hinzugefügt
      formData.append("SessionName", fileNameWithoutExtension); // Hinzugefügt
      formData.append("datetime", datetimeOfMeas); // Hinzugefügt

      const response = await axios.post(
        "http://localhost:8000/newSession/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.message == "Session Created") {
        setNewSessionError("");
        setNewSession(false);
        loadSessionsInProject(project);
      } else {
        setNewSessionError(response.data.message);
      }
    } catch (error: any) {
      setNewSessionError("Some error occured. Please try again later!");
    }
  };

  // choose session functionalities
  const [baseSession, setBaseSession] = useState("");
  const [nextSession, setNextSession] = useState("");
  const [baseSessionPoints, setBaseSessionPoints] = useState<Session[]>([]);
  const [nextSessionPoints, setNextSessionPoints] = useState<Session[]>([]);

  const handleBaseSessionChange = (event: any) => {
    const selectedBaseSessionName = event.target.value;
    setBaseSession(selectedBaseSessionName);
    const basePts = sessionData.filter(
      (session) => session.sessionName === selectedBaseSessionName
    );
    setBaseSessionPoints(basePts);
  };

  const handleNextSessionChange = (event: any) => {
    const selectedNextSessionName = event.target.value;
    setNextSession(selectedNextSessionName);
    const nextPts = sessionData.filter(
      (session) => session.sessionName === selectedNextSessionName
    );
    setNextSessionPoints(nextPts);
  };


  return (
    <main className="h-full grid grid-rows-2 grid-cols-4 gap-4">
      <div className="h-full row-span-2 col-span-1 min-w-fit">
        <div className="bg-slate-500 pl-7 pr-2 h-full">
          <Button clickFunc={changeNewProj} text="Neues Projekt" />
          {newProj && (
            <div
              id="modal"
              onClick={handleOutsideClick}
              className=" fixed inset-0 flex items-center justify-center  bg-zinc-600/40"
            >
              <div className=" bg-zinc-600 m-auto w-1/2 p-5 rounded-3xl relative min-w-fit">
                <button
                  onClick={changeNewProj}
                  className=" px-2 float-right text-5xl absolute top-0 right-0"
                >
                  &times;
                </button>
                <form onSubmit={handleNewProjectSubmit}>
                  <h1 className=" text-3xl font-semibold mb-8">
                    Neues Projekt erstellen
                  </h1>
                  <p>Projektname</p>
                  <input
                    type="text"
                    className="w-full border border-gray-300 my-2 mb-8 text-black rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:text-black"
                    placeholder="Projektname"
                    required
                  />
                  <p>Projektersteller</p>
                  <p className=" my-2 mb-8">{userName}</p>
                  <p>Kunde</p>
                  <input
                    type="email"
                    className="w-full border border-gray-300 my-2 mb-8 text-black rounded px-3 py-2 focus:outline-none focus:border-blue-400 focus:text-black"
                    placeholder="Kunde"
                    required
                  />
                  <p>{newProjectError}</p>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 my-2 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Projekt erstellen
                  </button>
                </form>
              </div>
            </div>
          )}

          <Button clickFunc={handleOpenProjects} text="Projekt öffnen" />
          {openProj && (
            <div
              id="modal"
              onClick={handleOutsideClick}
              className=" fixed inset-0 flex items-center justify-center  bg-zinc-600/40"
            >
              <div className=" bg-zinc-600 m-auto w-1/2 p-5 rounded-3xl relative flex flex-col min-w-fit">
                <button
                  onClick={changeOpenProj}
                  className=" px-2 float-right text-5xl absolute top-0 right-0"
                >
                  &times;
                </button>
                <h1 className=" text-3xl font-semibold mb-8">
                  Eigene Projekte
                </h1>
                {userProjects.map(
                  (project) =>
                    project[1] == userId && (
                      <button
                        key={project[0]}
                        onClick={() => loadProject(project[3])}
                      >
                        {project[3]}
                      </button>
                    )
                )}
                <br />
                <h1 className=" text-3xl font-semibold mb-8">
                  Fremde Projekte
                </h1>
                {userProjects.map(
                  (project) =>
                    project[2] == userId && (
                      <button
                        key={project[0]}
                        onClick={() => loadProject(project[3])}
                      >
                        {project[3]}
                      </button>
                    )
                )}
              </div>
            </div>
          )}
          {project !== "nicht gewählt" && (
            <>
              <Button clickFunc={changeNewSession} text="Session erfassen" />
              {newSession && (
                <div
                  id="modal"
                  onClick={handleOutsideClick}
                  className=" fixed inset-0 flex items-center justify-center  bg-zinc-600/40"
                >
                  <div className=" bg-zinc-600 m-auto w-1/2 p-5 rounded-3xl relative min-w-fit">
                    <button
                      onClick={changeNewSession}
                      className=" px-2 float-right text-5xl absolute top-0 right-0"
                    >
                      &times;
                    </button>
                    <h1 className=" text-3xl font-semibold">
                      Session erfassen
                    </h1>
                    <h1 className=" text-2xl font-semibold mb-8">
                      Projekt: {project}
                    </h1>
                    <p>
                      Die Session wird gleich benannt wie die hochgeladene
                      Datei!
                    </p>
                    <br />
                    <p>Format:</p>
                    <p>Nr,E,N,H</p> <br /> <br />
                    <form onSubmit={handleCreateSessionSubmit}>
                      <input type="file" accept=".csv" required /> <br /> <br />
                      <p>Aufnahmezeitpunkt:</p>
                      <input
                        className=" text-zinc-900"
                        type="datetime-local"
                        placeholder="Datum auswählen"
                        required
                      />{" "}
                      <br /> <br />
                      {newSessionError !== "" && <p>{newSessionError}</p>}
                      <button type="submit">Session hochladen</button>
                    </form>
                  </div>
                </div>
              )}
              <h1>
                Projekt:
                <br />
                {project}
              </h1>
              <p>Sessionen:</p>
              <p>{getSessionerror}</p>
              <form>
                <label>Nullmessung: </label>
                <select onChange={handleBaseSessionChange}>
                  <option value="placeholder">Select a session</option>
                  {sessionData.map((session) => (
                    <option key={session.sessionId} value={session.sessionName}>
                      {session.sessionName}
                    </option>
                  ))}
                </select>
                <label>Folgemessung: </label>
                <select onChange={handleNextSessionChange}>
                  <option value="placeholder">Select a session</option>
                  {sessionData.map((session) => (
                    <option key={session.sessionId} value={session.sessionName}>
                      {session.sessionName}
                    </option>
                  ))}
                </select>
              </form>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-rows-2 col-span-3 row-span-2 gap-4">
        <Map />
        <Detail baseSessionPoints={baseSessionPoints[0]} nextSessionPoints={nextSessionPoints[0]} />
      </div>
    </main>
  );
};

export default Settings;
