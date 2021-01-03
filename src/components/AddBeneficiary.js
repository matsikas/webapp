import React, { Component } from 'react';
import { Input, Button, Label, Header, Message, Checkbox } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import Disburse from '../contracts';

class AddBeneficiary extends Component {

    state = {
        web3: null,
        disburse: null,        
        beneficiaryAddress: '',
        amount: '',
        delayInSeconds: '',
        cancelAllowed: false,
        availableFunds: '',
        errorMessage: '',
        loading: false
    } 

    updateAvailableFundsBalance = async () => {

        if (this.props.trustAddress != null){

            // Update allocated funds balance
            var trustBalance = await this.state.disburse.methods.getTrustBalance(this.props.trustAddress).call();
            var allocatedBalance = await this.state.disburse.methods.getBeneficiaryBalance(this.props.trustAddress).call();
        
            var weiBalance = 0;
            if (trustBalance >= 0 && allocatedBalance >= 0){
                weiBalance = trustBalance - allocatedBalance;
            }
        
            var etherBalance = this.state.web3.utils.fromWei(weiBalance.toString(), 'ether');
            this.setState({ availableFunds: etherBalance });

            // When this balance updates, we need to update the balance on other components
            this.props.parentForceUpdate();
        }
    }

    onClickAdd = async (event) => {

        // This prevents form from being submitted to the server
        event.preventDefault();
        this.setState({loading: true});

        try {
            console.log("START ADD BENEFICIARY");

            var weiAmount = this.state.web3.utils.toWei(this.state.amount, 'ether');    
            console.log("ADD: " + this.state.beneficiaryAddress);
            console.log("DELAY: " + this.state.delayInSeconds);
            console.log("AMT: " + weiAmount);  
            console.log("CANCEL ALLOWED: " + this.state.cancelAllowed);
            
            await this.state.disburse.methods.addBeneficiarySeconds(
                                    this.state.beneficiaryAddress, 
                                    this.state.delayInSeconds, 
                                    weiAmount,
                                    this.state.cancelAllowed)
                                .send({from: this.props.trustAddress});

            this.updateAvailableFundsBalance();

            // Clear fields
            this.setState({beneficiaryAddress: ''});
            this.setState({amount: ''});
            this.setState({delayInSeconds: ''});
            //this.setState({cancelAllowed: false});
            this.setState({errorMessage: '' });
        }
        catch(err)
        {
            this.setState({ errorMessage: err.message });
        }

        this.setState({loading: false});

        this.forceUpdate();
    }

    displayError() {       
        if (this.state.errorMessage.length > 0) {
            return (<Message error header="Oops!" content={this.state.errorMessage} />);
        }
    }

    toggleCheckboxValue = (e, { checked }) => {
        console.log('CHECKBOX: ' + checked);
        this.setState({cancelAllowed: checked});
    }

    componentDidMount = async (web3) => {

        if (web3 !== undefined){

            this.setState({web3: web3});
            this.setState({disburse: Disburse(web3)});

            // Removing this line cause the form to not load
            await web3.eth.net.getId();  

            this.updateAvailableFundsBalance();
        }
    }

    render() {
        /*
        <Input label='Funding Address:' value={this.props.trustAddress} />
        <br /><br />
        */
        return (
            <div>
                <Header sub>2. Add an address that will receive specified funds after the payment date.</Header>
                <br />
                <Input label='Receiving Address:' placeholder='0x...' onChange = {event => this.setState({beneficiaryAddress: event.target.value})} />
                <br /><br />
                <Input labelPosition='right' type='text' placeholder='Amount'>
                    <Label>Amount:</Label>
                    <input value={this.state.amount} onChange={event => this.setState({amount: event.target.value})} />
                    <Label basic>ETH</Label>
                </Input>
                <br /><br />
                <Input label='Payment Date:' placeholder='01/30/2020' onChange={event => this.setState({delayInSeconds: event.target.value})} />
                <br /><br />
                <Checkbox label='Allow Cancellation Before Payment Date' onChange={this.toggleCheckboxValue} />
                <br /><br />
                <Label size='large' color='teal'>Available Funds: {this.state.availableFunds} ETH</Label>
                <br /><br />
                {this.displayError()}
                <Button loading={this.state.loading} primary onClick={this.onClickAdd}>Add</Button>
            </div>
        );
    }
}

export default AddBeneficiary;
