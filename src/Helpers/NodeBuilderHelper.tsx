import { Handle, Position } from "@xyflow/react";
import { HandleInfo } from "../Models/HandleInfo";
import { ColorHelper } from "./ColorHelper";
import SvgArray from "../Icons/SvgIcons/SvgArray";
import { JSX } from "react";
import { HandleGroup } from "../Models/HandleGroups";

export class NodeBuilderHelper {
    public static GenerateHandles(handleGroups: HandleGroup[], isInputHandler: boolean): JSX.Element[] {
        return handleGroups.map((group: HandleGroup): JSX.Element => {
            return (
                <div
                    key={isInputHandler ? `input-group-${group.instanceGuid}`: `output-group-${group.instanceGuid}`}
                    style={group.applyVisuals ? {
                        background: group.color,
                        border: `1px solid ${group.color.replace('0.3', '0.6')}`,
                        borderRadius: '5px 5px 5px 5px',
                        padding: '2px 0px',
                        marginBottom: '4px',
                        fontWeight: 500,
                        fontSize: 'var(--font-size)',
                        color: 'var(--font-color)',
                        userSelect: 'none'
                    } : undefined}
                >

                    {group.handles.map((handleInfo: HandleInfo): JSX.Element => {
                        const handleColor: string = ColorHelper.getColorForSchema(handleInfo.schema);
                        const handleStyle = {
                            borderColor: handleColor,
                            verticalAlign: "middle",
                            borderWidth: 2,
                            width: 12,
                            height: 12,
                            transform: 'none',
                            top: 0,
                            left: 0,
                            right: 0,
                            position: 'relative' as const,
                            borderRadius: 150
                        };


                        const mainText = [
                            handleInfo.description ? `Description: ${handleInfo.description}` : "",
                            handleInfo.example ? `Example: ${handleInfo.example}` : "",
                        ].filter(Boolean).join(" ");

                        const tooltipString = [mainText, `Type: ${handleInfo.namespace}.${handleInfo.schema}`].filter(Boolean).join("\n\n");

                        return (
                            <div
                                key={`handle-${handleInfo.instanceGuid}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isInputHandler ? "start" : "end",
                                    flexDirection: isInputHandler ? "row-reverse" : "row",
                                    transform: 'none',
                                    position: 'relative',
                                    height: 22,
                                }}>
                                <div
                                    title={tooltipString}
                                    data-toggle="tooltip"
                                    style={{ margin: '0px 5px 0px 5px', display: 'flex', flexDirection: isInputHandler ? "row" : "row-reverse" }}>
                                    {handleInfo.required ? (
                                        <>
                                            <div style={{ fontSize: 'x-small', color: 'white', margin: '0px 5px 0px 5px' }}>
                                                {handleInfo.name}
                                            </div>
                                            <div style={{ fontSize: 'x-small', color: 'red', margin: '0px 5px 0px 5px' }}>
                                                * required
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: 'x-small', color: 'white', margin: '0px 5px 0px 5px' }}>
                                            {handleInfo.name}
                                        </div>
                                    )}
                                </div>
                                <Handle
                                    id={handleInfo.instanceGuid}
                                    title={tooltipString}
                                    data-toggle="tooltip"
                                    type={isInputHandler ? "target" : "source"}
                                    style={handleStyle}
                                    position={isInputHandler ? Position.Left : Position.Right}>
                                    {handleInfo.isArray && (
                                        <div style={{ pointerEvents: 'none', color: handleColor, transform: 'translateY(-3px)' }}>
                                            <SvgArray width="100%" height="100%" />
                                        </div>
                                    )}
                                </Handle>
                            </div>
                        );
                    })}
                </div>);
        });
    }
}