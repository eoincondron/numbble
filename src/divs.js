import React from "react";


export function SingleNumTile(props) {
    // clicking this will remove any adjacent brackets
    return (
        <div className="num_tile block placed" style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

//  ==================================== ===


export function MultiNumTile(props) {
    // Clicking will split this into single digits
    return (
        <div className="num_tile block placed" style={props.style} onClick={props.onClick}>
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


export function DormantOpTile(props) {
    // Render op tile in the initial state. On click will make it waiting.
    return (
        <button className="op_tile block dormant" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===


export function WaitingOpTile(props) {
    // Render op tile that has been clicked. This will have different style (place and colour) to highlight.
    // Clicking will render dormant.
    return (
        <button className="op_tile block waiting" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===

export function PlacedOpTile(props) {
    // Render op tile that has been placed. This will have a different position to the dormant op tile.
    // Clicking will move it back to the dormant state.
    return (
        <button className="op_tile block placed" style={props.style} onClick={props.onClick}>
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
