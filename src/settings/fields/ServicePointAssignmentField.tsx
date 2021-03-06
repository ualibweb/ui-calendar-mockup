import { MultiSelection, OptionSegment } from "@folio/stripes-components";
import { MultiSelectionFieldRenderProps } from "@folio/stripes-components/types/lib/MultiSelection/MultiSelection";
import fuzzysort from "fuzzysort";
import React, { FunctionComponent, useMemo } from "react";
import { Field } from "react-final-form";
import { ServicePoint } from "../../types/types";

interface ServicePointAssignmentFieldProps {
  servicePoints: ServicePoint[];
}

const ServicePointAssignmentField: FunctionComponent<
  ServicePointAssignmentFieldProps
> = (props: ServicePointAssignmentFieldProps) => {
  const servicePointsForSearch = useMemo(
    () =>
      props.servicePoints.map((servicePoint) =>
        fuzzysort.prepare(servicePoint.name)
      ),
    [props.servicePoints]
  );

  const formatter = ({
    option,
    searchTerm,
  }: {
    option: ServicePoint;
    searchTerm: string | undefined;
  }) => {
    if (typeof searchTerm !== "string" || searchTerm === "") {
      return <OptionSegment>{option.name}</OptionSegment>;
    }

    const result = fuzzysort.single(searchTerm, option.name);

    // this should not happen as all elements passed to this function should have been found
    if (result === null) return <></>;

    return (
      <OptionSegment>
        {fuzzysort.highlight(result, (m, i) => (
          <strong key={i}>{m}</strong>
        ))}
      </OptionSegment>
    );
  };

  return (
    <Field
      name="service-points"
      component={
        MultiSelection<
          ServicePoint,
          MultiSelectionFieldRenderProps<ServicePoint>
        >
      }
      label="Service points"
      formatter={formatter}
      filter={(filterText: string | undefined, list: ServicePoint[]) => {
        if (typeof filterText !== "string" || filterText === "") {
          return { renderedItems: list, exactMatch: false };
        }

        // must spread and re-collect into a new array, as the returned array is immutable
        const results = [...fuzzysort.go(filterText, servicePointsForSearch)];

        // score descending, then name ascending
        // fixes "service point 1".."service point 4" etc having undefined order
        results.sort((a, b) => {
          if (a.score === b.score) {
            return a.target.localeCompare(b.target);
          }
          return -(a.score - b.score);
        });

        return {
          renderedItems: results.map((result) => ({
            label: result.target,
          })),
          exactMatch: false,
        };
      }}
      itemToString={(servicePoint: ServicePoint | undefined) => {
        if (typeof servicePoint === "object" && servicePoint !== null) {
          return servicePoint.name;
        } else {
          return "";
        }
      }}
      dataOptions={props.servicePoints}
    />
  );
};

export default ServicePointAssignmentField;
