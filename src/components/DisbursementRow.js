import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../web3';
import contract from '../contracts';

class DisbursementRow extends Component {

    state = {
        readyToDisburse: false,
        errorMessage: '',
        loading: false
    }     

    componentDidMount = async () => {
        await web3.eth.net.getId();  
        
        const disburse = new web3.eth.Contract(contract.ABI, contract.CONTRACT_ADDRESS);
        var beneficiaryId = this.props.beneficiary['id'];
        var trustAddress = this.props.beneficiary['trustAddress'];
        var ready = await disburse.methods.readyToDisburse(trustAddress, beneficiaryId).call({from: trustAddress});
        this.setState({readyToDisburse: ready});
    }

    onClickReceive = async (event) => {
        // This prevents form from being submitted to the server
        event.preventDefault();
        this.setState({loading: true});

        try {
            console.log("RECEIVE");
            var beneficiaryId = this.props.beneficiary['id'];
            var trustAddress = this.props.beneficiary['trustAddress'];
            var beneficiaryAddress = this.props.beneficiary['beneficiaryAddress'];

            console.log("DISBURSE TO BENEFICIARY (id): " + beneficiaryId);

            const disburse = new web3.eth.Contract(contract.ABI, contract.CONTRACT_ADDRESS);
            
            var readyToDisburse = await disburse.methods.readyToDisburse(trustAddress, beneficiaryId).call({from: trustAddress});
            if (readyToDisburse){
                console.log("DISBURSE INITIATED (id): " + beneficiaryId);
                console.log("DISBURSE INITIATED (address): " + beneficiaryAddress);
                await disburse.methods.disburseFunds(trustAddress, beneficiaryId).send({from: beneficiaryAddress});
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

    timeConverter = () => {
        var unix_timestamp = this.props.beneficiary['disburseDate'];
        var a = new Date(unix_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    render() {

        // Retrieve key variables from beneficiary    
        // var beneficiaryId = this.props.beneficiary['id'];
        var trustAddress = this.props.beneficiary['trustAddress'];
        var beneficiaryAmount = this.props.beneficiary['amount'];
        //var beneficiaryDisbursement = this.props.beneficiary['disburseDate'];
    
        return (
            <Table.Row>
                <Table.Cell>{trustAddress}</Table.Cell>
                <Table.Cell>{web3.utils.fromWei(beneficiaryAmount, 'ether')}</Table.Cell>
                <Table.Cell>{this.timeConverter()}</Table.Cell>
                <Table.Cell>
                    {!this.state.readyToDisburse ? 'Please wait for disbursement date.' : (
                        <Button
                            loading={this.state.loading} 
                            color='teal'
                            basic
                            onClick={this.onClickReceive}>Accept</Button>
                    )}    
                </Table.Cell>
            </Table.Row>
        );        
    }
}

export default DisbursementRow;