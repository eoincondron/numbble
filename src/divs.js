import React from "react";


export function NumTile(props) {
    return (
        <div className="num_tile block" style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

//  ==================================== ===


export function Spacer(props) {
    return (
        <div className="spacer block" style={props.style} onClick={props.onClick}>
        </div>
    );
}

// ==================================== ===


export function OpTile(props) {
    return (
        <button className="op_tile block" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===


export function BracketTile(props) {
    return (
        <div className='bracket_tile block' style={props.style} onClick={props.onClick}>
            ( )
        </div>
    );
}


export function ResetTile(props) {
    return (
        <button className="reset_tile" style={props.style} onClick={props.onClick}>
            Reset
        </button>
    );
}

//  =================================== ===


export function Equation(props) {
    return (
        <div className="equation">
            Equation: {props.equation}
        </div>
    );
}

//  =================================== ===

export function PlayButton(props) {
    return (
        <div className='play button' onClick={props.onClick}>
            Play
        </div>
    );
}
