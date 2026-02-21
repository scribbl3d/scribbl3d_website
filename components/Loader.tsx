import styled from "styled-components";

const Loader = () => {
    return (
        <Overlay>
            <StyledWrapper>
                <div className="boxes">
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                    <div className="box">
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                </div>
            </StyledWrapper>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    z-index: 9999;
`;

const StyledWrapper = styled.div`
    .boxes {
        --size: 32px;
        --duration: 800ms;
        height: calc(var(--size) * 2);
        width: calc(var(--size) * 3);
        position: relative;
        transform-style: preserve-3d;
        transform-origin: 50% 50%;
        margin-top: calc(var(--size) * 1.5 * -1);
        transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
    }

    .boxes .box {
        width: var(--size);
        height: var(--size);
        top: 0;
        left: 0;
        position: absolute;
        transform-style: preserve-3d;
    }

    .boxes .box:nth-child(1) {
        transform: translate(100%, 0);
        animation: box1 var(--duration) linear infinite;
    }

    .boxes .box:nth-child(2) {
        transform: translate(0, 100%);
        animation: box2 var(--duration) linear infinite;
    }

    .boxes .box:nth-child(3) {
        transform: translate(100%, 100%);
        animation: box3 var(--duration) linear infinite;
    }

    .boxes .box:nth-child(4) {
        transform: translate(200%, 0);
        animation: box4 var(--duration) linear infinite;
    }

    .boxes .box > div {
        --background: #5c8df6;
        --translateZ: calc(var(--size) / 2);
        position: absolute;
        width: 100%;
        height: 100%;
        background: var(--background);
        transform: rotateY(var(--rotateY, 0deg)) rotateX(var(--rotateX, 0deg))
            translateZ(var(--translateZ));
    }

    .boxes .box > div:nth-child(1) {
        top: 0;
        left: 0;
    }
    .boxes .box > div:nth-child(2) {
        --background: #145af2;
        right: 0;
        --rotateY: 90deg;
    }
    .boxes .box > div:nth-child(3) {
        --background: #447cf5;
        --rotateX: -90deg;
    }
    .boxes .box > div:nth-child(4) {
        --background: #dbe3f4;
        top: 0;
        left: 0;
        --translateZ: calc(var(--size) * 3 * -1);
    }

    @keyframes box1 {
        0%,
        50% {
            transform: translate(100%, 0);
        }
        100% {
            transform: translate(200%, 0);
        }
    }
    @keyframes box2 {
        0% {
            transform: translate(0, 100%);
        }
        50% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(100%, 0);
        }
    }
    @keyframes box3 {
        0%,
        50% {
            transform: translate(100%, 100%);
        }
        100% {
            transform: translate(0, 100%);
        }
    }
    @keyframes box4 {
        0% {
            transform: translate(200%, 0);
        }
        50% {
            transform: translate(200%, 100%);
        }
        100% {
            transform: translate(100%, 100%);
        }
    }
`;

export default Loader;
