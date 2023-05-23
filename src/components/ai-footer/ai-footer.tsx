
type Props = {
    message?: string;
}

const AiAppFooter = ({message}: Props): JSX.Element => {
    
    const textToDisplay:string = message ? message : 'AI generated content may be inaccurate, make sure to review it';

    return (
        <p>{textToDisplay}</p>
    );
}

export default AiAppFooter;