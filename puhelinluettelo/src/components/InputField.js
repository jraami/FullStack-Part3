import React from 'react'

const InputField = ({ text, value, onChange }) => {
    return (
        <div>
            {text}
            <input
                value={value}
                onChange={onChange} />
            <br />
        </div>
    )
}

export default InputField
