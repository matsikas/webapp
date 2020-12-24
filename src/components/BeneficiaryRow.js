import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../web3';

const DisburseJSON = require('../contracts/DisburseV1.json');

class BeneficiaryRow extends Component {

    state = {
        errorMessage: '',
        loading: false
    } 

    onClickDisburse = async (event) => {

        // This prevents form from being submitted to the server
        event.preventDefault();
        this.setState({loading: true});

        try {
            console.log("DISBURSE TO BENEFICIARY (id): " + this.props.id);
            console.log("TRUST: " + this.props.trustAddress);

            const disburse = new web3.eth.Contract(DisburseJSON.abi, this.props.contractAddress);
            
            var readyToDisburse = await disburse.methods.readyToDisburse(this.props.id).call({from: this.props.trustAddress});
            if (readyToDisburse){
                console.log("DISBURSE INITIATED (id): " + this.props.id);
                await disburse.methods.disburseFunds(this.props.id).send({from: this.props.trustAddress});
                this.props.parentCallback();
            }
            else{
                this.setState({ errorMessage: 'Disbursement deadline has not passed yet.' });
                this.props.errorCallback(this.state.errorMessage);
            }
        }
        catch(err)
        {
            this.setState({ errorMessage: err.message });
            this.props.errorCallback(this.state.errorMessage);
        }

        this.setState({loading: false}); 
    }

    onClickRemove = async (event) => {

        // This prevents form from being submitted to the server
        event.preventDefault();
        this.setState({loading: true});

        try {
            console.log("REMOVE BENEFICIARY (id): " + this.props.id);
            console.log("TRUST: " + this.props.trustAddress);

            const disburse = new web3.eth.Contract(DisburseJSON.abi, this.props.contractAddress);
            
            await disburse.methods.removeBeneficiary(this.props.id).send({from: this.props.trustAddress});
        
            this.props.parentCallback();
        }
        catch(err)
        {
            this.setState({ errorMessage: err.message });
            this.props.errorCallback();
        }

        this.setState({loading: false}); 
    }

    render() {
        return (
            <Table.Row>
                <Table.Cell>{this.props.id}</Table.Cell>
                <Table.Cell>{this.props.address}</Table.Cell>
                <Table.Cell>{this.props.amount}</Table.Cell>
                <Table.Cell>{this.props.disbursement}</Table.Cell>
                <Table.Cell>
                    <Button 
                        loading={this.state.loading} 
                        color='red' 
                        basic 
                        onClick={this.onClickRemove}>Remove</Button>
                </Table.Cell> 
                <Table.Cell>
                    <Button 
                        loading={this.state.loading} 
                        color='teal' 
                        basic 
                        onClick={this.onClickDisburse}>Disburse</Button>
                </Table.Cell> 
            </Table.Row>
        );        
    }
}

export default BeneficiaryRow;