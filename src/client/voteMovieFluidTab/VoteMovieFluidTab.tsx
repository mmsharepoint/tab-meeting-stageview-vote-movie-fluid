import * as React from "react";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import { app, FrameContexts } from "@microsoft/teams-js";
import { VoteMovieFluidResult } from "./VoteMovieFluidResult";
import { VoteMovieFluidVoting } from "./VoteMovieFluidVoting";

/**
 * Implementation of the Vote Movie Fluid content page
 */
export const VoteMovieFluidTab = () => {
    const [{ inTeams, theme, context }] = useTeams();
    const [meetingId, setMeetingId] = useState<string | undefined>();
    const [inStageView, setInStageView] = useState<boolean>(false);

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
    }, [context]);

    /**
     * The render() method to create the UI of the tab
     */
    return (
        <div>
            {context && meetingId && inStageView && <VoteMovieFluidResult meetingID={meetingId!} theme={theme} />}
            {context && meetingId && !inStageView && <VoteMovieFluidVoting userID={context?.user?.id!} meetingID={meetingId!} theme={theme} />}
        </div>
    );
};
