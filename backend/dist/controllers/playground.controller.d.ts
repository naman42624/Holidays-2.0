import { Request, Response } from 'express';
export declare class PlaygroundController {
    getPlaygroundData(req: Request, res: Response): Promise<void>;
    getTestData(req: Request, res: Response): Promise<void>;
    liveTest(req: Request, res: Response): Promise<void>;
    private getSampleFlightData;
    private getSampleLocationData;
    private getSampleHotelData;
    private getSampleActivityData;
}
export declare const playgroundController: PlaygroundController;
//# sourceMappingURL=playground.controller.d.ts.map