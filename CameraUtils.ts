import { MathUtils, OrthographicCamera, Vector3, WebGLRenderer } from "three"
import { Op3dContext } from "../../_context/Op3dContext"
import { eViewTypeSpheric, eViewTypeXYZ } from "../absSceneCube"
import { SceneContext } from "../SceneContext"
import { SceneCube } from "../SceneCube"
import { MathContext } from "../../_context/MathContext"
import { eViewMenuState } from "./ViewMenu/ViewMenu"
import CameraControls from "camera-controls"

export interface iRotationData {
    PHI: number,
    THETA: number,
    vector3: string
}

export enum eCameraView {
    'ISO-VIEW' = 'iso-view',
    'XY-VIEW' = 'xy-view',
    'YZ-VIEW' = 'yz-view',
    'XZ-VIEW' = 'xz-view',
}
export interface iCameraRotationData {
    FRONT: iRotationData,
    BACK: iRotationData,
    UP: iRotationData,
    DOWN: iRotationData,
    RIGHT: iRotationData,
    LEFT: iRotationData,
    FRONT_TOP_RIGHT: iRotationData,
    FRONT_TOP_LEFT: iRotationData,
    FRONT_BOTTOM_RIGHT: iRotationData,
    FRONT_BOTTOM_LEFT: iRotationData,
    BACK_TOP_RIGHT: iRotationData,
    BACK_TOP_LEFT: iRotationData,
    BACK_BOTTOM_RIGHT: iRotationData,
    BACK_BOTTOM_LEFT: iRotationData,
}


export namespace CameraUtils {
    const DEG90 = Math.PI * 0.5;
    const DEG180 = Math.PI;
    const DEG45 = Math.PI * 0.25;
    const DEG60 = Math.PI / 3;
    const DEG135 = Math.PI * 0.75;
    export const CAMERA_ROTATION_DATA: iCameraRotationData = {
        BACK: { PHI: 0, THETA: DEG90, vector3: '0,0,1' },
        FRONT: { PHI: DEG180, THETA: DEG90, vector3: '0,0,-1' },
        UP: { PHI: 0, THETA: 0, vector3: '0,1,0' },
        DOWN: { PHI: 0, THETA: DEG180, vector3: '0,-1,0' },
        RIGHT: { PHI: DEG90, THETA: DEG90, vector3: '1,0,0' },
        LEFT: { PHI: -DEG90, THETA: DEG90, vector3: '-1,0,0' },

        BACK_TOP_RIGHT: { PHI: DEG45, THETA: DEG60, vector3: '1,1,1' },
        BACK_TOP_LEFT: { PHI: -DEG45, THETA: DEG60, vector3: '-1,1,1' },
        FRONT_TOP_RIGHT: { PHI: DEG135, THETA: DEG60, vector3: '1,1,-1' },
        FRONT_TOP_LEFT: { PHI: -DEG135, THETA: DEG60, vector3: '-1,1,-1' },

        BACK_BOTTOM_RIGHT: { PHI: DEG45, THETA: DEG135, vector3: '1,-1,1' },
        BACK_BOTTOM_LEFT: { PHI: -DEG45, THETA: DEG135, vector3: '-1,-1,1' },
        FRONT_BOTTOM_RIGHT: { PHI: DEG135, THETA: DEG135, vector3: '1,-1,-1' },
        FRONT_BOTTOM_LEFT: { PHI: -DEG135, THETA: DEG135, vector3: '-1,-1,-1' },
    }
    //__________________________________________________________________________________________
    export const returnRotationDataByVector3 = (vector3Value: string) => {
        for (const key in CAMERA_ROTATION_DATA) {
            if (CAMERA_ROTATION_DATA.hasOwnProperty(key)) {
                if (CAMERA_ROTATION_DATA[key].vector3 === vector3Value) {
                    return { key, data: CAMERA_ROTATION_DATA[key] };
                }
            }
        }
        return null;
    }
    //__________________________________________________________________________________________

    export const switchSceneView = (pCoordsSys: string) => {
        let center = Op3dContext.PARTS_MANAGER.getCenter()
        let aSphericViewText
        switch (pCoordsSys) {
            case eViewTypeXYZ.XY_VIEW:
                SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.XY_VIEW
                _enableFourView(false)
                setCameraView(center, eViewTypeXYZ.XY_VIEW)

                addReturnToUserViewCallback(eViewTypeXYZ.XY_VIEW)

                aSphericViewText = eViewTypeSpheric.FRONT
                break;
            case eViewTypeXYZ.YZ_VIEW:
                SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.YZ_VIEW
                _enableFourView(false)
                setCameraView(center, eViewTypeXYZ.YZ_VIEW)

                addReturnToUserViewCallback(eViewTypeXYZ.YZ_VIEW)
                aSphericViewText = eViewTypeSpheric.RIGHT
                break;
            case eViewTypeXYZ.XZ_VIEW:
                SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.XZ_VIEW
                _enableFourView(false)
                setCameraView(center, eViewTypeXYZ.XZ_VIEW)

                addReturnToUserViewCallback(eViewTypeXYZ.XZ_VIEW)
                aSphericViewText = eViewTypeSpheric.TOP
                break
            case eViewTypeXYZ.ISO_VIEW:
                SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.ISO_VIEW
                _enableFourView(false)
                setCameraView(center, eViewTypeXYZ.ISO_VIEW)

                addReturnToUserViewCallback(eViewTypeXYZ.ISO_VIEW)
                aSphericViewText = eViewTypeSpheric.ISO_VIEW
                break
            case eViewTypeXYZ.FOUR_WINDOW_VIEW:
                _enableFourView(true)
                break;
        }

        if (eViewTypeXYZ.FOUR_WINDOW_VIEW === pCoordsSys) return

        if (SceneContext.CURRENT_VIEW.mode === eViewMenuState.XYZ) {
            SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.ISO_VIEW
            SceneContext.getCanvasByViewType(eViewTypeXYZ.ISO_VIEW).setAttribute('data-content', pCoordsSys)
        } else {
            SceneContext.getCanvasByViewType(eViewTypeXYZ.ISO_VIEW).setAttribute('data-content', aSphericViewText)
        }


    }
    //__________________________________________________________________________________________
    const addReturnToUserViewCallback = (pViewType: eViewTypeXYZ) => {
        const someFunc = () => {
            let aAzimuth = MathUtils.radToDeg(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.azimuthAngle).toFixed(0)
            let aPolar = MathUtils.radToDeg(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.polarAngle).toFixed(0)
            const aViewAngles = {
                [eViewTypeXYZ.ISO_VIEW]: { PHI: 65, THETA: 225 },
                [eViewTypeXYZ.XY_VIEW]: { PHI: 90, THETA: 90 },
                [eViewTypeXYZ.YZ_VIEW]: { PHI: 90, THETA: 180 },
                [eViewTypeXYZ.XZ_VIEW]: { PHI: 0, THETA: 180 },
            }

            if (aAzimuth !== aViewAngles[pViewType].PHI || aPolar !== aViewAngles[pViewType].THETA) {
                SceneContext.getCanvasByViewType(eViewTypeXYZ.ISO_VIEW).setAttribute('data-content', 'User view')
                SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.removeEventListener('controlstart', someFunc);
            }
        }
        SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.addEventListener('controlstart', someFunc);
    }
    //__________________________________________________________________________________________
    export const returnXYZAngles = () => {
        const horizontalAngle = +CameraUtils.phi().toFixed(0);
        const verticalAngle = +CameraUtils.theta().toFixed(0);

        let aZAngle = 360 - Math.abs((90 - horizontalAngle))
        if (horizontalAngle < 90) {
            aZAngle = 90 - horizontalAngle
        }
        const aXAngle = horizontalAngle

        return { X: aXAngle, Y: verticalAngle, Z: aZAngle };
    }
    //__________________________________________________________________________________________
    const changeLabelsForFourViews = () => {
        if (SceneContext.CURRENT_VIEW.mode === eViewMenuState.SPHERIC) {
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XY_VIEW).setAttribute('data-content', eViewTypeSpheric.FRONT)
            SceneContext.getCanvasByViewType(eViewTypeXYZ.YZ_VIEW).setAttribute('data-content', eViewTypeSpheric.RIGHT)
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XZ_VIEW).setAttribute('data-content', eViewTypeSpheric.TOP)
        } else {
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XY_VIEW).setAttribute('data-content', eViewTypeXYZ.XY_VIEW)
            SceneContext.getCanvasByViewType(eViewTypeXYZ.YZ_VIEW).setAttribute('data-content', eViewTypeXYZ.YZ_VIEW)
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XZ_VIEW).setAttribute('data-content', eViewTypeXYZ.XZ_VIEW)
        }

    }
    //__________________________________________________________________________________________
    export const _enableFourView = (pState: boolean) => {
        changeLabelsForFourViews()
        if (pState) {

            SceneContext.CURRENT_VIEW.type = eViewTypeXYZ.FOUR_WINDOW_VIEW
            SceneContext.OP3D_SCENE.cube.cubeRenderer.setSize(100, 100);
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XY_VIEW).classList.remove('hide_view')
            SceneContext.getCanvasByViewType(eViewTypeXYZ.YZ_VIEW).classList.remove('hide_view')
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XZ_VIEW).classList.remove('hide_view')

            SceneContext.RENDERER.setSize(Op3dContext.CONTAINER.clientWidth / 2,
                Op3dContext.CONTAINER.clientHeight / 2);
            SceneContext.SPRITE_RENDERER.setSize(Op3dContext.CONTAINER.clientWidth / 2,
                Op3dContext.CONTAINER.clientHeight / 2);
            _setFourViewsSize(SceneContext.CAMERA, SceneContext.RENDERER)

            SceneContext.OP3D_SCENE.updateRendererSize();
            let center = Op3dContext.PARTS_MANAGER.getCenter()
            SceneContext.OP3D_SCENE.lookAt = center

            fitToZoom()

            if (Op3dContext.PARTS_MANAGER.parts.length > 1) {
                SceneContext.CAMERA2.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true)
                SceneContext.CAMERA3.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true)
                SceneContext.CAMERA4.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true)
            }
        } else {

            SceneContext.OP3D_SCENE.cube.cubeRenderer.setSize(SceneCube.SIZE, SceneCube.SIZE);

            SceneContext.getCanvasByViewType(eViewTypeXYZ.XY_VIEW).classList.add('hide_view')
            SceneContext.getCanvasByViewType(eViewTypeXYZ.YZ_VIEW).classList.add('hide_view')
            SceneContext.getCanvasByViewType(eViewTypeXYZ.XZ_VIEW).classList.add('hide_view')

            SceneContext.RENDERER.setSize(Op3dContext.CONTAINER.clientWidth,
                Op3dContext.CONTAINER.clientHeight);
            SceneContext.SPRITE_RENDERER.setSize(Op3dContext.CONTAINER.clientWidth,
                Op3dContext.CONTAINER.clientHeight);
        }
        SceneContext.OP3D_SCENE.activateRenderer(2500)
    }

    //__________________________________________________________________________________________
    export const updateFourViews = () => {
        SceneContext.RENDERER2.render(SceneContext.MAIN_SCENE, SceneContext.CAMERA2.cameraControls.camera)
        SceneContext.RENDERER3.render(SceneContext.MAIN_SCENE, SceneContext.CAMERA3.cameraControls.camera)
        SceneContext.RENDERER4.render(SceneContext.MAIN_SCENE, SceneContext.CAMERA4.cameraControls.camera)
    }
    //__________________________________________________________________________________________
    export const _setFourViewsSize = (pCamera: OrthographicCamera, pRenderer: WebGLRenderer) => {
        let width = Op3dContext.CONTAINER.clientWidth / 2
        let height = Op3dContext.CONTAINER.clientHeight / 2
        let aFrustumScale = 3;
        pCamera.left = -width / aFrustumScale
        pCamera.right = width / aFrustumScale
        pCamera.top = height / aFrustumScale
        pCamera.bottom = -height / aFrustumScale
        pCamera.updateProjectionMatrix();
        pRenderer.setSize(width, height);

    }
    //__________________________________________________________________________________________
    export const setCameraView = (pCenter: Vector3, pViewType: eViewTypeXYZ) => {
        SceneContext.OP3D_SCENE.lookAt = pCenter;
        switch (pViewType) {
            case eViewTypeXYZ.XY_VIEW:

                rotateTo(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls, CAMERA_ROTATION_DATA.FRONT)
                if (Op3dContext.PARTS_MANAGER.parts.length > 1) {
                    SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true)
                }
                break;
            case eViewTypeXYZ.YZ_VIEW:

                rotateTo(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls, CAMERA_ROTATION_DATA.LEFT)
                if (Op3dContext.PARTS_MANAGER.parts.length > 1) {
                    SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true, { paddingLeft: 1, paddingRight: 0 })
                }

                break;
            case eViewTypeXYZ.XZ_VIEW:

                rotateTo(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls, CAMERA_ROTATION_DATA.UP)
                if (Op3dContext.PARTS_MANAGER.parts.length > 1) {
                    SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.fitToBox(Op3dContext.PARTS_MANAGER.partsContainer, true, { paddingLeft: 0, paddingRight: 0, paddingBottom: 0.5, paddingTop: 2 })
                }
                break;
            case eViewTypeXYZ.ISO_VIEW:

                rotateTo(SceneContext.OP3D_SCENE.op3dCameraController.cameraControls, CAMERA_ROTATION_DATA.FRONT_TOP_LEFT)

                SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.fitToSphere(Op3dContext.PARTS_MANAGER.partsContainer, true)

                break;
        }

        if (Op3dContext.PARTS_MANAGER.parts.length <= 1) {
            SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.zoomTo(0.3, true)
        }
        SceneContext.OP3D_SCENE.activateRenderer(3000)

        CameraUtils._updateOnWindowResize(SceneContext.CAMERA, SceneContext.RENDERER)
    }

    //__________________________________________________________________________________________


    export const rotateTo = (pCameraControls: CameraControls, pRotationData: iRotationData, pWithTransition: boolean = false) => {
        pCameraControls.rotateTo(pRotationData.PHI, pRotationData.THETA, pWithTransition);
    }
    //_______________________________________________________________________________
    export const _updateOnWindowResize = (pCamera: OrthographicCamera, pRenderer: WebGLRenderer) => {
        let width = Op3dContext.CONTAINER.clientWidth
        let height = Op3dContext.CONTAINER.clientHeight

        pCamera.left = -width / 3
        pCamera.right = width / 3
        pCamera.top = height / 3
        pCamera.bottom = -height / 3
        pCamera.updateProjectionMatrix();
        pRenderer.setSize(width, height);
    }
    //_______________________________________________________________________________
    export const setTheta = (pTheta: number) => {
        let aTheta = MathUtils.degToRad(pTheta)

        SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.polarAngle = +aTheta
        SceneContext.OP3D_SCENE.activateRenderer()
    }
    //_______________________________________________________________________________
    export const setPhi = (pPhi: number) => {
        let aPhi = MathUtils.degToRad(pPhi);
        SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.azimuthAngle = +aPhi
        SceneContext.OP3D_SCENE.activateRenderer()
    }
    //_______________________________________________________________________________
    export const phi = () => {
        return SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.azimuthAngle * MathUtils.RAD2DEG
    }
    //_______________________________________________________________________________
    export const theta = () => {
        let aTheta = SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.polarAngle
        if (aTheta <= 0) {
            aTheta = MathContext.EPSILON_10;
        } else if (aTheta >= Math.PI) {
            aTheta = Math.PI - MathContext.EPSILON_10;
        }
        return aTheta * MathUtils.RAD2DEG
    }
    //_______________________________________________________________________________
    export const setDefault = () => {
        SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.reset()
        SceneContext.OP3D_SCENE.activateRenderer(5000)
    }
    //_______________________________________________________________________________
    export const setIsometricView = () => {
        if (Op3dContext.PARTS_MANAGER.parts.length <= 1) {
            setDefault()
            return
        }
        setCameraView(Op3dContext.PARTS_MANAGER.getCenter(), eViewTypeXYZ.ISO_VIEW)
        SceneContext.OP3D_SCENE.activateRenderer(5000)
    }
    //_______________________________________________________________________________
    export const fitToZoom = () => {
        if (Op3dContext.PARTS_MANAGER.parts.length <= 1) {
            setDefault()
            return
        }
        SceneContext.OP3D_SCENE.op3dCameraController.cameraControls.fitToSphere(Op3dContext.PARTS_MANAGER.partsContainer, true)
        SceneContext.OP3D_SCENE.activateRenderer(5000)

    }

}