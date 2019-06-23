import React from 'react';
import { Button, Form, Col, Row, FormControlProps } from 'react-bootstrap';
import { API_CALL } from './constant';
import { GlobalSpinner } from './GlobalSpinner';
import { HIGHLIGHT_TYPES } from './options';

interface FORM_OPTION_OBJ {
    [typeKey: string]: string;
}

type Props = { onResponse: Function };
type State = { showSpinner: boolean; selectedObj: FORM_OPTION_OBJ, valid: boolean };

export interface APIResponse {
    // moment: string;
    // type: string;
    url: string;
}

export class HighlightForm extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            showSpinner: false,
            selectedObj: {},
            valid: false
        };
    }

    typeKeys = Object.keys(HIGHLIGHT_TYPES);


    convertBooleanForWicket = (value: string): boolean | undefined => {
        const val: any = {
            "undefined": null,
            "true": true,
            "false": false
        }
        return val[value];
    }

    onSelect = (typeKey: string, value: string) => {
        const selectObjToUpdate: FORM_OPTION_OBJ = this.state.selectedObj;
        if (value) {
            selectObjToUpdate[typeKey] = value;
        } else {
            delete (selectObjToUpdate[typeKey]);
        }

        const setKeys = Object.keys(selectObjToUpdate);
        let valid = true;
        let i = 0;
        for (i = 0; i < this.typeKeys.length; i++) {
            const key = this.typeKeys[i];
            if (HIGHLIGHT_TYPES[key].required) {
                if (!setKeys.includes(key)) {
                    valid = false;
                    break;
                }
            }
        }
        if (i !== this.typeKeys.length) {
            valid = false;
        }
        this.setState({
            selectedObj: selectObjToUpdate,
            valid
        });
    }

    callApi = () => {
        this.setState({
            showSpinner: true
        })
        const paramToSend: any = this.state.selectedObj;
        paramToSend["wicket"] = this.convertBooleanForWicket(paramToSend["wicket"]);
        fetch(API_CALL.IP + API_CALL.ENDPOINT,
            {
                method: API_CALL.METHOD,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // make sure to serialize your JSON body
                body: JSON.stringify({
                    parameters: paramToSend
                })
            }
        ).then((res) => {
            return res.json()
        }).then((res: APIResponse) => {
            this.setState({
                showSpinner: false
            })
            this.props.onResponse(res);
        }).catch(err => {
            this.setState({
                showSpinner: false
            })
            this.props.onResponse({ url: "" })
        })
    }

    render() {
        return (
            <>
                {this.state.showSpinner && <GlobalSpinner />}
                <Row noGutters>
                    <h4>Highlights Viewer</h4>
                </Row>
                {this.typeKeys.map(optionKey => {
                    return (<Row noGutters key={optionKey}>
                        <Form.Group as={Col}>
                            <Form.Label>{HIGHLIGHT_TYPES[optionKey].title}</Form.Label>
                            <Form.Control as="select" onChange={(e: React.ChangeEvent<FormControlProps>) => { this.onSelect(optionKey, e.target.value ? e.target.value : "") }}>
                                <option value="">Select Moment</option>
                                {HIGHLIGHT_TYPES[optionKey].options.map((option) => {
                                    return <option key={option.title} value={option.value}>{option.title}</option>;
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Row>)
                })}
                <br></br>
                <Row noGutters>
                    <Button disabled={!this.state.valid} variant="info" style={{ width: "100%" }} onClick={this.callApi}>
                        Show Highlight
                </Button>
                </Row>
            </>
        );
    }
} 