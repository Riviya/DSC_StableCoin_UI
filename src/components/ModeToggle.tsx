"use client";

import React from 'react';
import { DEMO_CONSTANTS } from '../app/constants/demoConstants';

interface ModeToggleProps {
    isDemoMode: boolean;
    onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ isDemoMode, onToggle }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '18%',
            right: '1.5%',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: isDemoMode ? '#7a0c0c95' : '#085626c6',
            padding: '12px 16px',
            borderRadius: '30px',
            border: '2px solid',
            borderColor: isDemoMode ? '#740d0dff' : '#10b981',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            scale: '0.8',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                <span>{isDemoMode ? DEMO_CONSTANTS.DEMO_LABEL : DEMO_CONSTANTS.LIVE_LABEL}</span>
                <span style={{
                    fontSize: '11px',
                    opacity: 0.8,
                }}>

                </span>
            </div>

            <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px',
                cursor: 'pointer',
            }}>
                <input
                    type="checkbox"
                    checked={!isDemoMode}
                    onChange={onToggle}
                    style={{
                        opacity: 0,
                        width: 0,
                        height: 0,
                    }}
                />
                <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDemoMode ? '#eb170cff' : '#30dc0eff',
                    transition: '0.3s',
                    borderRadius: '12px',
                }}>
                    <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: isDemoMode ? '3px' : '23px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%',
                    }} />
                </span>
            </label>

        </div>
    );
};

export default ModeToggle;