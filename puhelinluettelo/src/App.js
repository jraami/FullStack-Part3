import React from 'react';
import ListEntry from './components/ListEntry'
import InputField from './components/InputField'
import JSONService from './services/JSONService'
import Notification from './components/Notification';

const notificationSuccess = 'notification_success'
const notificationFailure = 'notification_failure'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            phonebook: [],
            newName: '',
            newNumber: '',
            entriesToShow: [],
            searchString: '',
            error: {
                message: '',
                className: ''
            }
        }
    }


    setNotification(message, errorClass) {
        this.setState({
            error: {
                message: message,
                className: errorClass
            }
        })
        setTimeout(() => {
            this.setState({
                error: {
                    message: null
                }
            })
        }, 5000)
    }

    componentDidMount() {
        JSONService
            .getAll()
            .then(phonebook => {
                this.setState({
                    phonebook,
                    entriesToShow: phonebook
                })
            })
            .catch(error => { })
    }

    addPerson = (event) => {
        event.preventDefault()
        if (this.state.newName === '') {
            this.setNotification('Please enter a name.', notificationFailure)
        }
        else if (this.state.newNumber === '') {
            this.setNotification('Please enter a number, too.', notificationFailure)
        }
        else {
            let found = this.state.phonebook.find(entry => entry.name.toLowerCase() == this.state.newName.toLowerCase());
            if (found !== undefined) {
                const personObject = {
                    ...found,
                    number: this.state.newNumber
                }
                JSONService
                    .change(found.id, personObject)
                    .then(response => {
                        const phonebook = this.state.phonebook.map(entry => entry.id !== found.id ? entry : personObject)
                        this.setState({
                            newName: '',
                            newNumber: '',
                            phonebook: phonebook,
                            entriesToShow: phonebook
                        })
                        this.setNotification('Modified ' + personObject.name + ' to phonebook.', notificationSuccess)
                    })
                    .catch(error => {
                        this.setNotification('Unable to modify ' + personObject.name + ' for some reason.', notificationFailure)
                    })
            }
            else {
                const personObject = {
                    name: this.state.newName,
                    number: this.state.newNumber
                }

                JSONService
                    .create(personObject)
                    .then(entry => {
                        this.setState({
                            phonebook: this.state.phonebook.concat(entry),
                            entriesToShow: this.state.phonebook.concat(entry),
                            newName: '',
                            newNumber: '',
                            searchString: ''
                        })
                        this.setNotification('Added ' + personObject.name + ' to phonebook.', notificationSuccess)
                    })
                    .catch(error => {
                        this.setNotification('Unable to add ' + personObject.name + ' for some reason.', notificationFailure)
                    })
            }
        }
    }

    deletePerson = (event, id) => {
        event.preventDefault()
        JSONService
            .remove(id)
            .then(entry => {
                JSONService
                    .getAll()
                    .then(phonebook => {
                        this.setState({
                            phonebook,
                            entriesToShow: phonebook
                        })
                        this.setNotification('Deleted an entry from the phonebook.', notificationSuccess)
                    })
            })
            .catch(error => {
                this.setNotification(this.state.phonebook.find(entry => entry.id === id).name + ' was not found on the server.', notificationFailure)
                this.componentDidMount()
            })

    }
    // Event handlers for name, number and search fields:

    handleNameChange = (event) => this.setState({ newName: event.target.value })
    handleNumberChange = (event) => this.setState({ newNumber: event.target.value })
    handleSearchChange = (event) => {
        this.setState({ searchString: event.target.value })
        if (event.target.value === '') {
            this.setState({
                entriesToShow: this.state.phonebook
            })
        }
        else {
            this.setState({
                entriesToShow: this.state.phonebook.filter(entry => {
                    const entryInLowercase = entry.name.toLowerCase()
                    const filter = event.target.value.toLowerCase()
                    return entryInLowercase.includes(filter)
                })
            })
        }
    }

    render() {

        return (

            < div >
                <h2>Puhelinluettelo</h2>
                <form onSubmit={this.addPerson}>
                    <InputField text="Nimi:" value={this.state.newName} onChange={this.handleNameChange} />
                    <InputField text="Numero:" value={this.state.newNumber} onChange={this.handleNumberChange} />
                    <div>
                        <button type="submit">Lisää</button>
                    </div>
                    <Notification className={this.state.error.className} message={this.state.error.message} />
                </form>
                <h2>Numerot</h2>
                <InputField text="Hae nimellä:" value={this.state.searchString} onChange={this.handleSearchChange} />
                <div>
                    {this.state.entriesToShow.map(entry => <ListEntry key={entry.id} entry={entry} button="true" buttonOnClick={(event) => this.deletePerson(event, entry.id)} />)}
                </div>
            </div >
        )
    }
}
export default App
