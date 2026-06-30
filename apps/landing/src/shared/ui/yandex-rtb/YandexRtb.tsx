import Script from "next/script";
import { YANDEX_RTB_CONTEXT_SRC, YANDEX_RTB_FLOOR_AD } from "./constants";

const floorAdRenderScript = `window.yaContextCb.push(() => {
  Ya.Context.AdvManager.render({
    blockId: "${YANDEX_RTB_FLOOR_AD.blockId}",
    type: "${YANDEX_RTB_FLOOR_AD.type}",
    platform: "${YANDEX_RTB_FLOOR_AD.platform}"
  });
});`;

export function YandexRtb() {
  return (
    <>
      <Script id="yandex-rtb-init" strategy="beforeInteractive">
        {"window.yaContextCb=window.yaContextCb||[]"}
      </Script>
      <Script
        id="yandex-rtb-context"
        src={YANDEX_RTB_CONTEXT_SRC}
        strategy="afterInteractive"
      />
      <Script id="yandex-rtb-floor-ad" strategy="afterInteractive">
        {floorAdRenderScript}
      </Script>
    </>
  );
}
