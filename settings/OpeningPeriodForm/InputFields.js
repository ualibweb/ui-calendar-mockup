import React from 'react';
import {Row, Col} from '@folio/stripes-components/lib/LayoutGrid';
import Datepicker from "../../../stripes-components/lib/Datepicker/Datepicker";
import {Field} from 'redux-form';
import PropTypes from 'prop-types';
import Textfield from "../../../stripes-components/lib/TextField";
import TextField from "@folio/stripes-components/lib/TextField/TextField";
import moment from "moment";

class InputFields extends React.Component {

    static propTypes = {
        onDateChange: PropTypes.func.isRequired,
        onNameChange: PropTypes.func.isRequired,
    };


    constructor() {
        super();
        this.parseDate = this.parseDate.bind(this);
        // this.parseDates = this.parseDates.bind(this);
        this.setName = this.setName.bind(this);
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
    }

    // parseDate(e) {
    //     let str = '';
    //     for (let p in e) {
    //         if (e.hasOwnProperty(p) && p != "preventDefault") {
    //             str += e[p];
    //         }
    //     }
    //     return str;
    // }

    componentDidMount() {
        console.log(this.props);
    }

    parseDate(date) {
        console.log(date);
        console.log(new Date(date));

        return new Date(date);
    }

    setStartDate(e) {
        this.props.onDateChange(true, this.parseDate(e));
    }

    setEndDate(e) {
        this.props.onDateChange(false, this.parseDate(e));
    }

    setName(e) {
        this.props.onNameChange(e.target.value);
    }

    render() {

        let modifyStart;
        let modifyEnd;
        let modifyName;
        if (this.props.modifyPeriod) {

            modifyStart = <Field initialValues={ "2000-11-11"}
                                 name="startDate"
                                 component={Datepicker}
                                 label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.validFrom'})}
                                 dateFormat="YYYY-MM-DD"
                                 onChange={this.setStartDate}
            />;

            modifyEnd = <Field value={this.parseDate(this.props.modifyPeriod.endDate) || ''}
                               name="endDate"
                               component={Datepicker}
                               label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.validTo'})}
                               dateFormat={this.props.stripes.intl.formatMessage({id: 'ui-calendar.dateFormat'})}
                               onChange={this.setEndDate}/>;

            modifyName = <TextField label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.name'})}
                                    value={this.props.modifyPeriod.name || ''} ref="periodName" name="periodName"
                                    id="input-period-name" component={Textfield} onChange={this.setName}/>;


        } else {

            modifyStart = <Field name="startDate"
                                 component={Datepicker}
                                 label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.validFrom'})}
                                 dateFormat={this.props.stripes.intl.formatMessage({id: 'ui-calendar.dateFormat'})}
                                 onChange={this.setStartDate}/>;

            modifyEnd = <Field name="endDate"
                               component={Datepicker}
                               label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.validTo'})}
                               dateFormat={this.props.stripes.intl.formatMessage({id: 'ui-calendar.dateFormat'})}
                               onChange={this.setEndDate}/>;

            modifyName =
                <TextField label={this.props.stripes.intl.formatMessage({id: 'ui-calendar.name'})} ref="periodName"
                           name="periodName" id="input-period-name" component={Textfield} onChange={this.setName}/>

        }

        return (
            <div>
                <Row>
                    <Col sm={4}>
                        {modifyStart}
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        {modifyEnd}
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        {modifyName}
                    </Col>
                </Row>
            </div>
        );

    }
}

export default InputFields;
