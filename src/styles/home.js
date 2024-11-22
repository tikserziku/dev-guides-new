const homePageStyles = `
    textarea {
        width: 100%;
        height: 150px;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        resize: vertical;
    }
    button {
        background: #0366d6;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
    }
    button:hover {
        background: #0256b9;
    }
    #output {
        margin-top: 20px;
    }
    .code-section {
        margin-top: 20px;
        background: #2d2d2d;
        padding: 15px;
        border-radius: 4px;
        color: #fff;
    }
    .code-header {
        background: #1e1e1e;
        padding: 8px 15px;
        margin: -15px -15px 15px;
        border-radius: 4px 4px 0 0;
        font-family: monospace;
    }
    #error {
        color: #dc3545;
        padding: 10px;
        background: #fee;
        border-radius: 4px;
        margin: 10px 0;
        display: none;
    }
    #loading {
        display: none;
        color: #666;
        margin: 10px 0;
        text-align: center;
    }
`;

module.exports = homePageStyles;