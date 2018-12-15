import React from 'react'
import Button from './Button'

const ListEntry = ({ entry, button, buttonOnClick }) => {
    const ButtonRender = () => {
        if (button)
            return (<Button handler={buttonOnClick} text="Delete" />)
        else
            return (" ")
    }
    return (
        <div>
            {entry.name}: {entry.number} <ButtonRender /><br /><br />
        </div>
    )
}

export default ListEntry