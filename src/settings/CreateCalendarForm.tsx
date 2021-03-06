import {
  Accordion,
  AccordionSet,
  Col,
  Datepicker as DateField,
  ExpandAllButton,
  getLocaleDateFormat,
  getLocalizedTimeFormatInfo,
  Row,
  TextField,
} from "@folio/stripes-components";
import { DatepickerFieldRenderProps as DateFieldRenderProps } from "@folio/stripes-components/types/lib/Datepicker/Datepicker";
import { TextFieldRenderProps } from "@folio/stripes-components/types/lib/TextField/TextField";
import { CalloutContext } from "@folio/stripes-core";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FormApi, SubmissionErrors } from "final-form";
import memoizee from "memoizee";
import React, { FunctionComponent, useContext, useMemo, useRef } from "react";
import { Field, Form } from "react-final-form";
import { useIntl } from "react-intl";
import { ServicePoint } from "../types/types";
import ExceptionField from "./fields/ExceptionField";
import { ExceptionRowState } from "./fields/ExceptionFieldTypes";
import validate, { FormValues, InnerFieldRefs } from "./fields/formValidation";
import HoursOfOperationField from "./fields/HoursOfOperationField";
import { HoursOfOperationRowState } from "./fields/HoursOfOperationFieldTypes";
import RowType from "./fields/RowType";
import ServicePointAssignmentField from "./fields/ServicePointAssignmentField";
import { CALENDARS } from "./MockConstants";

dayjs.extend(customParseFormat);

const TextFieldComponent = TextField<string, TextFieldRenderProps<string>>;
const DateFieldComponent = DateField<DateFieldRenderProps>;

export const FORM_ID = "ui-calendar-create-calendar-form";

export interface CreateCalendarFormProps {
  closeParentLayer: () => void;
  submitAttempted: boolean;
  setIsSubmitting: (isSaving: boolean) => void;
  servicePoints: ServicePoint[];
}

export const CreateCalendarForm: FunctionComponent<CreateCalendarFormProps> = (
  props: CreateCalendarFormProps
) => {
  const calloutContext = useContext(CalloutContext);

  const onSubmit = (
    values: FormValues,
    form: FormApi<FormValues>,
    callback?: (errors?: SubmissionErrors) => void
  ): SubmissionErrors | Promise<SubmissionErrors> | void => {
    if (form.getState().hasValidationErrors) {
      return undefined;
    }

    console.table({
      values,
      form,
      callback,
    });

    props.setIsSubmitting(true);

    return new Promise((resolve) =>
      setTimeout(() => {
        calloutContext.sendCallout({
          message: "Test Callout error",
          type: "error",
        });
        props.setIsSubmitting(false);
        if (form.getState().errors?.aaaaaaaa !== undefined) {
          props.closeParentLayer();
        }

        resolve({ name: "foo" });
      }, 500)
    );
    // props.closeParentLayer();
    // return new Promise<void>((reject) => reject());
  };

  // TODO: not this
  const processInitialValues = memoizee(
    (initialValues: Partial<FormValues>): Partial<FormValues> => ({
      ...initialValues,
      "hours-of-operation": CALENDARS[3].openings.map(
        (opening, i): HoursOfOperationRowState => ({
          type: RowType.Open,
          i: -1 - i, // ensure `i` is negative as not to conflict
          ...opening,
        })
      ),
      exceptions: CALENDARS[3].exceptions.map(
        (exception, i): ExceptionRowState => {
          const result: ExceptionRowState = {
            i: -1 - i, // ensure `i` is negative as not to conflict
            type:
              exception.openings.length === 0 ? RowType.Closed : RowType.Open,
            name: exception.name,
            lastRowI: 0,
            rows: [],
          };

          if (result.type === RowType.Open) {
            exception.openings.forEach((opening, j) =>
              result.rows.push({ i: -1 - j, ...opening })
            );
          } else {
            result.rows.push({
              i: -1,
              startDate: exception.startDate,
              startTime: undefined,
              endDate: exception.endDate,
              endTime: undefined,
            });
          }

          return result;
        }
      ),
    })
  );

  const intl = useIntl();
  const localeDateFormat = getLocaleDateFormat({ intl });
  const localeTimeFormat = getLocalizedTimeFormatInfo(intl.locale).timeFormat;

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const innerFieldRefs = useRef<InnerFieldRefs>({
    hoursOfOperation: { startTime: {}, endTime: {} },
    exceptions: { startDate: {}, startTime: {}, endDate: {}, endTime: {} },
  });

  const validationFunction = useMemo(
    () =>
      validate.bind(
        this,
        localeDateFormat,
        localeTimeFormat,
        { startDateRef, endDateRef },
        innerFieldRefs.current
      ),
    [localeDateFormat, localeTimeFormat, startDateRef, endDateRef]
  );

  return (
    <Form<FormValues>
      // submitting={foo}
      onSubmit={onSubmit}
      validate={validationFunction}
      validateOnBlur
      render={(params) => {
        const {
          handleSubmit,
          errors,
          submitErrors,
          touched,
          dirtyFieldsSinceLastSubmit,
          active,
          initialValues: _initialValues,
          values,
        } = params;

        console.table(
          values
          // form,
          // callback,
        );

        const initialValues = processInitialValues(_initialValues);

        return (
          <form id={FORM_ID} onSubmit={handleSubmit}>
            <AccordionSet>
              <Row end="xs">
                <Col xs>
                  <ExpandAllButton />
                </Col>
              </Row>
              <Accordion label="General information">
                <Row>
                  <Col xs={12} md={6}>
                    <Field
                      component={TextFieldComponent}
                      autoFocus
                      required
                      name="name"
                      label="Calendar name"
                      error={
                        (!dirtyFieldsSinceLastSubmit?.name &&
                          submitErrors?.name) ||
                        ((props.submitAttempted || touched?.name) && active !== "name" && errors?.name)
                      }
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Field
                      component={DateFieldComponent}
                      inputRef={startDateRef}
                      backendDateStandard="YYYY-MM-DD"
                      required
                      usePortal
                      name="start-date"
                      label="Start date"
                      error={
                        (!dirtyFieldsSinceLastSubmit?.["start-date"] &&
                          submitErrors?.["start-date"]) ||
                        ((props.submitAttempted || touched?.["start-date"]) &&
                          active !== "start-date" &&
                          errors?.["start-date"])
                      }
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Field
                      component={DateFieldComponent}
                      inputRef={endDateRef}
                      backendDateStandard="YYYY-MM-DD"
                      required
                      usePortal
                      name="end-date"
                      label="End date"
                      error={
                        (!dirtyFieldsSinceLastSubmit?.["end-date"] &&
                          submitErrors?.["end-date"]) ||
                        ((props.submitAttempted || touched?.["end-date"]) &&
                          active !== "end-date" &&
                          errors?.["end-date"])
                      }
                    />
                  </Col>
                </Row>
                <ServicePointAssignmentField
                  servicePoints={props.servicePoints}
                />
              </Accordion>
              <Accordion label="Hours of operation">
                <Field
                  name="hours-of-operation"
                  component={HoursOfOperationField}
                  timeFieldRefs={innerFieldRefs.current.hoursOfOperation}
                  error={errors?.["hours-of-operation"]}
                  initialValue={initialValues["hours-of-operation"]}
                  localeTimeFormat={localeTimeFormat}
                  submitAttempted={props.submitAttempted}
                />
              </Accordion>
              <Accordion label="Exceptions">
                <Field
                  name="exceptions"
                  component={ExceptionField}
                  fieldRefs={innerFieldRefs.current.exceptions}
                  error={errors?.exceptions}
                  initialValue={initialValues.exceptions}
                  localeTimeFormat={localeTimeFormat}
                  submitAttempted={props.submitAttempted}
                />
              </Accordion>
            </AccordionSet>
          </form>
        );
      }}
    />
  );
};

export default CreateCalendarForm;
