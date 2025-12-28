import { createContext, ReactNode } from 'react';
import './Panel.css';

type PanelContextType = { id: string };
const PanelContext = createContext<PanelContextType | null>(null);

// Panel root
const Panel = ({ id, children, panelHeight }: { id: string; children: ReactNode; panelHeight: string }) => {
    return (
        <PanelContext.Provider value={{ id }}>
            <div data-panel-id={id} className="panel" style={{ height: panelHeight }} >
                {children}
            </div>
        </PanelContext.Provider>
    );
};

// Panel header (optional slot)
const Header = ({ children }: { children: ReactNode; }) => {
    return <div className="panel-header"> {children}</div>;
};

const Search = ({ children }: { children: ReactNode }) => {
    return <div className="panel-search">{children}</div>;
};

// Panel body (optional slot)
const Body = ({ children }: { children: ReactNode }) => {
    return <div className="panel-body"> {children} </div>;
};

// Group all components together
export const Panels = { Panel, Header, Search, Body };
