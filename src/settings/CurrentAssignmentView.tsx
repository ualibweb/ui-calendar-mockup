import {
  Button,
  LoadingPane,
  MultiColumnList,
  Pane,
  PaneMenu,
} from "@folio/stripes-components";
import {
  ConnectedComponent,
  ConnectedComponentProps,
} from "@folio/stripes-connect";
import React, { useEffect, useRef, useState } from "react";
import { Route, useHistory, useRouteMatch } from "react-router-dom";
import * as CalendarUtils from "./CalendarUtils";
import CreateCalendarLayer from "./CreateCalendarLayer";
import DataRepository from "./DataRepository";
import InfoPane from "./InfoPane";
import * as MockConstants from "./MockConstants";
import { MANIFEST, Resources } from "./SharedData";

export type CurrentAssignmentViewProps = ConnectedComponentProps<Resources>;

export const CurrentAssignmentView: ConnectedComponent<
  CurrentAssignmentViewProps,
  Resources
> = (props: CurrentAssignmentViewProps) => {
  const [dataRepository, setDataRepository] = useState(
    new DataRepository(props.resources, props.mutator)
  );
  useEffect(
    () => setDataRepository(new DataRepository(props.resources, props.mutator)),
    [props.resources, props.mutator]
  );

  const [showCreateLayer, setShowCreateLayer] = useState(false);
  const showCreateLayerButtonRef = useRef<HTMLButtonElement>(null);
  const history = useHistory();
  const currentRouteId = useRouteMatch<{ servicePointId: string }>(
    "/settings/calendar/active/:servicePointId"
  )?.params?.servicePointId;

  if (!dataRepository.isLoaded()) {
    return <LoadingPane paneTitle="Current calendar assignments" />;
  }

  const rows = dataRepository.getServicePoints().map((servicePoint) => {
    const calendars = MockConstants.CALENDARS.filter(
      (calendar) =>
        MockConstants.MOCKED_DATE_OBJ.isBetween(
          calendar.startDate,
          calendar.endDate,
          "day",
          "[]"
        ) && calendar.servicePoints.includes(servicePoint.id)
    );
    if (calendars.length === 0) {
      return {
        servicePoint: servicePoint.name.concat(
          servicePoint.inactive ? " (inactive)" : ""
        ),
        calendarName: (
          <div style={{ fontStyle: "italic", color: "grey" }}>None</div>
        ),
        startDate: "",
        endDate: "",
        currentStatus: "Closed",
        calendar: null,
      };
    }
    return {
      servicePointId: servicePoint.id,
      servicePoint: servicePoint.name.concat(
        servicePoint.inactive ? " (inactive)" : ""
      ),
      calendarName: calendars[0].name,
      startDate: calendars[0].startDate,
      endDate: calendars[0].endDate,
      currentStatus: CalendarUtils.getStatus(
        MockConstants.MOCKED_DATE_TIME_OBJ,
        calendars[0]
      ),
      calendar: calendars[0],
    };
  });

  return (
    <>
      <Pane
        paneTitle="Current calendar assignments"
        defaultWidth={currentRouteId === undefined ? "fill" : "20%"}
        lastMenu={
          <PaneMenu>
            <Button
              buttonStyle="primary"
              marginBottom0
              onClick={() => setShowCreateLayer(true)}
              ref={showCreateLayerButtonRef}
            >
              New
            </Button>
          </PaneMenu>
        }
      >
        <MultiColumnList
          sortedColumn="servicePoint"
          sortDirection="ascending"
          onHeaderClick={() => ({})}
          columnMapping={{
            servicePoint: "Service point",
            calendarName: "Calendar name",
            startDate: "Start date",
            endDate: "End date",
            currentStatus: "Current status",
          }}
          contentData={rows}
          rowMetadata={["servicePointId", "calendar"]}
          isSelected={({ item }) => {
            return (
              currentRouteId !== undefined &&
              item.servicePointId === currentRouteId
            );
          }}
          onRowClick={(_e, info) => {
            if (
              info.startDate === "" ||
              info.servicePointId === currentRouteId
            ) {
              // no cal assigned or being toggled off
              history.push("/settings/calendar/active/");
            } else {
              // new cal
              history.push(`/settings/calendar/active/${info.servicePointId}`);
            }
          }}
        />
      </Pane>
      <Route path="/settings/calendar/active/:id">
        <InfoPane
          onClose={() => {
            history.push("/settings/calendar/active/");
          }}
          calendar={
            rows.filter((row) => row.servicePointId === currentRouteId)[0]
              ?.calendar
          }
        />
      </Route>
      <CreateCalendarLayer
        dataRepository={dataRepository}
        isOpen={showCreateLayer}
        onClose={() => {
          setShowCreateLayer(false);
          showCreateLayerButtonRef.current?.focus();
        }}
      />
    </>
  );
};

CurrentAssignmentView.manifest = MANIFEST;

export default CurrentAssignmentView;
