import * as React from "react";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import { app, FrameContexts } from "@microsoft/teams-js";
import { VoteMovieFluidResult } from "./VoteMovieFluidResult";
import { VoteMovieFluidVoting } from "./VoteMovieFluidVoting";
import { SharedMap } from 'fluid-framework';
import Axios from "axios";
import { getFluidContainer } from "../utils";

/**
 * Implementation of the Vote Movie Fluid content page
 */
export const VoteMovieFluidTab = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [meetingId, setMeetingId] = useState<string | undefined>();
  const [inStageView, setInStageView] = useState<boolean>(false);
  const [containerId, setContainerId] = useState<string>();
  const [fluidContainerMap, setFluidContainerMap] = useState<SharedMap>();
  const [movie1, setMovie1] = useState<string>();
  const [movie2, setMovie2] = useState<string>();
  const [movie3, setMovie3] = useState<string>();

  const setFluidAccess = async () => {
    const fluidContainer = await getFluidContainer(context?.user?.id!, undefined, containerId);
    if (fluidContainer !== undefined) {
      const sharedVotes = fluidContainer.initialObjects.sharedVotes as SharedMap;
      setFluidContainerMap(sharedVotes);
    }
      
  };
    useEffect(() => {
        if (inTeams === true) {
            app.notifySuccess();
        }
    }, [inTeams]);

    useEffect(() => {
      let meeting = "";
      if (context?.meeting?.id === "") {
          meeting = "alias";
      }
      else {
          meeting = context?.meeting?.id!;
      }
      setMeetingId(meeting);
      
      if (context?.page.frameContext === FrameContexts.meetingStage) {
          setInStageView(true);
      }
      else {
          setInStageView(false);
      }
      Axios.get(`https://${process.env.PUBLIC_HOSTNAME}/api/config/${meeting}`).then((response) => {
        const config = response.data;
        setMovie1(config.movie1url);
        setMovie2(config.movie2url);
        setMovie3(config.movie3url);
        setContainerId(config.containerId);
        });
    }, [context]);

    /**
     * The render() method to create the UI of the tab
     */
    return (
        <div>
            {context && meetingId && inStageView && <VoteMovieFluidResult 
                                    meetingID={meetingId!} 
                                    theme={theme}
                                    movie1Url={movie1!} 
                                    movie2Url={movie2!} 
                                    movie3Url={movie3!} 
                                    votingMap={fluidContainerMap!} />}
            {context && meetingId && !inStageView && 
              <VoteMovieFluidVoting userID={context?.user?.id!} 
                                    meetingID={meetingId!} 
                                    theme={theme} 
                                    movie1Url={movie1!} 
                                    movie2Url={movie2!} 
                                    movie3Url={movie3!} 
                                    votingMap={fluidContainerMap!} />}
        </div>
    );
};
