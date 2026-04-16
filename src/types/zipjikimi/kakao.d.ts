/**
 * @file kakao.d.ts
 * @description 카카오맵 JS SDK 전역 타입 (필요 최소)
 * @module types/zipjikimi
 */

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }

  interface KakaoNamespace {
    maps: {
      load: (callback: () => void) => void;
      LatLng: new (lat: number, lng: number) => KakaoLatLng;
      Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
      Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
      MarkerImage: new (
        src: string,
        size: KakaoSize,
        options?: { offset?: KakaoPoint },
      ) => KakaoMarkerImage;
      Circle: new (options: KakaoCircleOptions) => KakaoCircle;
      Size: new (width: number, height: number) => KakaoSize;
      Point: new (x: number, y: number) => KakaoPoint;
      CustomOverlay: new (
        options: KakaoCustomOverlayOptions,
      ) => KakaoCustomOverlay;
      event: {
        addListener: (target: unknown, type: string, handler: () => void) => void;
      };
    };
  }

  interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
  }

  interface KakaoMap {
    setCenter: (latlng: KakaoLatLng) => void;
    setLevel: (level: number) => void;
    getLevel: () => number;
    getCenter: () => KakaoLatLng;
    relayout: () => void;
  }

  interface KakaoMapOptions {
    center: KakaoLatLng;
    level: number;
    draggable?: boolean;
    disableDoubleClickZoom?: boolean;
  }

  interface KakaoMarker {
    setMap: (map: KakaoMap | null) => void;
    setPosition: (latlng: KakaoLatLng) => void;
  }

  interface KakaoMarkerOptions {
    position: KakaoLatLng;
    image?: KakaoMarkerImage;
    title?: string;
    clickable?: boolean;
  }

  type KakaoMarkerImage = object;

  interface KakaoSize {
    getWidth: () => number;
    getHeight: () => number;
  }

  interface KakaoPoint {
    getX: () => number;
    getY: () => number;
  }

  interface KakaoCircle {
    setMap: (map: KakaoMap | null) => void;
    setPosition: (latlng: KakaoLatLng) => void;
    setRadius: (r: number) => void;
  }

  interface KakaoCircleOptions {
    center: KakaoLatLng;
    radius: number;
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    fillColor?: string;
    fillOpacity?: number;
  }

  interface KakaoCustomOverlay {
    setMap: (map: KakaoMap | null) => void;
    setPosition: (latlng: KakaoLatLng) => void;
  }

  interface KakaoCustomOverlayOptions {
    position: KakaoLatLng;
    content: string | HTMLElement;
    yAnchor?: number;
    xAnchor?: number;
    zIndex?: number;
  }
}

export {};
