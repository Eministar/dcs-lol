import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LanguageProvider} from './contexts/LanguageContext';
import './index.css';

// Easter Egg Typen
interface EasterEggWindow extends Window {
    hello: () => void;
    steve: () => void;
    party: () => void;
    matrix: () => void;
    rainbow: () => void;
    secret: () => void;
}

// 🎮 Console Easter Eggs
const easterEggs = () => {
    // Cooles ASCII-Art Banner für DCS.LOL
    console.log(
        '%c     _                 _       _   \n' +
        '    | |               | |     | |  \n' +
        '  __| | ___ ___       | | ___ | |  \n' +
        ' / _` |/ __/ __|      | |/ _ \\| |  \n' +
        '| (_| | (__\\__ \\  _   | | (_) | |  \n' +
        ' \\__,_|\\___|___/ (_)  |_|\\___/|_|  \n',
        'color: #a855f7; font-weight: bold; font-size: 12px;'
    );

    console.log(
        '%c🔗 dcs.lol - Discord Link Shortener',
        'color: #a855f7; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);'
    );

    console.log(
        '%c👋 Hey there, curious developer!',
        'color: #22d3ee; font-size: 14px;'
    );

    console.log(
        '%c💡 Try typing these in the console:',
        'color: #facc15; font-size: 12px;'
    );

    console.log(
        '%c   • hello()      - Say hi!\n' +
        '   • steve()      - A special greeting\n' +
        '   • party()      - 🎉 Start the party\n' +
        '   • matrix()     - Enter the Matrix\n' +
        '   • rainbow()    - Rainbow mode!',
        'color: #94a3b8; font-size: 11px;'
    );

    const eggWindow = window as unknown as EasterEggWindow;

    // Easter Egg Funktionen global verfügbar machen
    eggWindow.hello = () => {
        console.log(
            '%c👋 Hello, friend! Welcome to dcs.lol!\n' +
            '%cWe\'re glad you\'re exploring. Have a great day! 🚀',
            'color: #22d3ee; font-size: 18px; font-weight: bold;',
            'color: #a3e635; font-size: 14px;'
        );
    };

    eggWindow.steve = () => {
        const steveArt = `
    ⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛🟫🟫🟫🟫🟫🟫⬛
    ⬛🏽🏽🏽🏽🏽🏽⬛
    ⬛🏽⬜⬛🏽⬛⬜⬛
    ⬛🏽🏽🟫🟫🏽🏽⬛
    ⬛🏽🏽🏽🏽🏽🏽⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛
    `;
        console.log(
            '%c🎮 Hello Steve! Ready to mine some links?',
            'color: #22c55e; font-size: 16px; font-weight: bold;'
        );
        console.log(steveArt);
        console.log(
            '%c⛏️ Fun fact: Shortening links is like mining diamonds - \n   you get something valuable from raw materials!',
            'color: #60a5fa; font-size: 12px;'
        );
    };

    eggWindow.party = () => {
        const emojis = ['🎉', '🎊', '🥳', '🎈', '🎁', '✨', '💫', '🌟', '⭐', '🔥'];
        console.log(
            '%c🎉 PARTY MODE ACTIVATED! 🎉',
            'color: #f43f5e; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(244, 63, 94, 0.5);'
        );

        let count = 0;
        const interval = setInterval(() => {
            const randomEmojis = Array(10).fill(0).map(() =>
                emojis[Math.floor(Math.random() * emojis.length)]
            ).join(' ');
            console.log(`%c${randomEmojis}`, 'font-size: 20px;');
            count++;
            if (count >= 5) clearInterval(interval);
        }, 300);
    };

    eggWindow.matrix = () => {
        console.log(
            '%c⬇️ Entering the Matrix... ⬇️',
            'color: #22c55e; font-size: 16px; font-weight: bold; background: black; padding: 10px;'
        );

        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
        let count = 0;
        const interval = setInterval(() => {
            const line = Array(50).fill(0).map(() =>
                chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            console.log(`%c${line}`, 'color: #22c55e; background: black; font-family: monospace;');
            count++;
            if (count >= 10) {
                clearInterval(interval);
                console.log(
                    '%c🐇 Follow the white rabbit... 🐇',
                    'color: #22c55e; font-size: 14px; font-weight: bold; background: black; padding: 5px;'
                );
            }
        }, 100);
    };

    eggWindow.rainbow = () => {
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        const text = 'R A I N B O W   M O D E !';

        const chars = text.split('');
        const styles = chars.map((_, i) =>
            `color: ${colors[i % colors.length]}; font-size: 20px; font-weight: bold;`
        );

        console.log(
            chars.map(() => '%c').join('') + chars.join(''),
            ...styles
        );

        console.log(
            '%c🌈 You found the rainbow! Here\'s a cookie: 🍪',
            'color: #a855f7; font-size: 14px;'
        );
    };

    // Geheimes Easter Egg
    eggWindow.secret = () => {
        console.log(
            '%c🤫 Psst... You found the secret!',
            'color: #fbbf24; font-size: 16px; font-weight: bold;'
        );
        console.log(
            '%c   Made with 💜 by the dcs.lol team\n' +
            '   Special thanks to everyone who uses our service!\n' +
            '   \n' +
            '   "The best code is no code, but since we need some,\n' +
            '    let\'s make it awesome!" 🚀',
            'color: #94a3b8; font-size: 12px;'
        );
    };
};

// Easter Eggs initialisieren
easterEggs();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LanguageProvider>
            <App/>
        </LanguageProvider>
    </StrictMode>
);