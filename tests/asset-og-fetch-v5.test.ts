import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/products";

const ids = [
  "axisflying-manta5-se-v2-squashed-x-o4-wide-elrs","betafpv-air65-ii-champion","betafpv-air65-ii-freestyle","betafpv-air65-ii-racing","betafpv-meteor75-pro-analog","betafpv-meteor75-pro-ii-o4-wide","emax-hawk-apex-5-hdzero-elrs-6s","geprc-cinebot35-o4-pro-elrs","geprc-cinelog30-v2-analog-elrs","geprc-cinelog30-v3-o4-pro-elrs","geprc-moz7-v2-analog","geprc-moz7-v2-o4-pro","geprc-tern-lr40-analog","geprc-vapor-d5-hd-o4-pro","geprc-vapor-x5-analog-6s","geprc-vapor-x5-hd-o4-pro","iflight-chimera7-pro-v2-o4-pro-6s","iflight-mach-r5-ultra-trainer-hdzero","iflight-nazgul-eco-dc5-o4-pro-6s","iflight-nazgul-eco-xl5-v1_1-analog-6s","iflight-sh-cinelr7-o4-pro-6s","vroom-comet-pro-5-wrekd-analog-elrs","vroom-comet-pro-5-wrekd-hdzero-elrs",
  "dji-goggles-3","dji-goggles-n3","fatshark-echo-analog","hdzero-goggle-2","skyzone-sky04x-pro",
  "radiomaster-boxer-elrs","radiomaster-gx12-gemini-x","radiomaster-pocket-crush-elrs","radiomaster-pocket-elrs","radiomaster-tx15-max-elrs","radiomaster-tx15-standard-elrs","radiomaster-tx16s-mk3-max-elrs","radiomaster-tx16s-mk3-elrs",
  "betafpv-6port-basic-1s-charger","betafpv-hexacharger-pro","geprc-woopower-w63","hota-d6-pro","hota-s6","hota-t6","isdt-608ac",
  "betafpv-lava-ii-1s-280","betafpv-lava-ii-1s-320","betafpv-lava-ii-1s-480","betafpv-lava-ii-1s-580","betafpv-lava-ii-1s-680","betafpv-lava-ii-4s-680","geprc-storm2-4s-850","gnb-1s-550-100c-a30","iflight-fullsend-6s-1550-150c","battery-iflight-fullsend-6s-3300","ovonic-6s-1300-100c","smc-hcl-rs-6s-1400","tattu-1s-300-75c-bt2","tattu-rline-v6-6s-1300-st",
] as const;

const sourceOverrides: Record<string, string> = {
  "axisflying-manta5-se-v2-squashed-x-o4-wide-elrs": "https://www.axisflying.com/products/manta-5-se-v2-squeshed-x-h743-fc",
  "radiomaster-boxer-elrs": "https://radiomasterrc.com/products/boxer-radio-controller-m2",
  "radiomaster-gx12-gemini-x": "https://radiomasterrc.com/products/gx12-dual-band-gemini-x-radio-controller",
  "radiomaster-pocket-crush-elrs": "https://radiomasterrc.com/products/pocket-crush-radio-controller",
  "radiomaster-pocket-elrs": "https://radiomasterrc.com/products/pocket-radio-controller-m2",
  "radiomaster-tx15-max-elrs": "https://radiomasterrc.com/products/tx15-max-radio-controller-elrs-m2",
  "radiomaster-tx15-standard-elrs": "https://radiomasterrc.com/products/tx15-radio-controller-elrs-m2",
  "radiomaster-tx16s-mk3-max-elrs": "https://radiomasterrc.com/products/tx16s-mk3-max-radio-controller-elrs-m2",
  "radiomaster-tx16s-mk3-elrs": "https://radiomasterrc.com/products/tx16s-mk3-radio-controller",
  "betafpv-6port-basic-1s-charger": "https://betafpv.com/products/bt2-0-ph2-0-1s-lipo-charger-adapter",
  "betafpv-hexacharger-pro": "https://betafpv.com/products/hexacharger-1s-charger",
  "geprc-woopower-w63": "https://geprc.com/product/geprc-woopower-w63-1s-charger/",
  "hota-d6-pro": "https://www.racedayquads.com/products/hota-d6-pro-dual-channel-325w-15a-ac-dc-battery-charger",
  "hota-s6": "https://www.racedayquads.com/products/hota-s6-ultra-650w-gan-sic-dual-channel-smart-charger",
  "hota-t6": "https://www.racedayquads.com/products/hota-t6-pd-15a-1-6s-ac-dc-smart-charger",
  "isdt-608ac": "https://www.isdt.co/608ac.html?lang=en",
  "betafpv-lava-ii-1s-280": "https://betafpv.com/products/lava-ii-1s-battery",
  "betafpv-lava-ii-1s-320": "https://betafpv.com/products/lava-ii-1s-battery",
  "betafpv-lava-ii-1s-480": "https://betafpv.com/products/lava-ii-1s-battery",
  "betafpv-lava-ii-1s-580": "https://betafpv.com/products/lava-ii-1s-battery",
  "betafpv-lava-ii-1s-680": "https://betafpv.com/products/lava-ii-1s-battery",
  "betafpv-lava-ii-4s-680": "https://betafpv.com/products/lava-ii-4s-battery",
  "geprc-storm2-4s-850": "https://geprc.com/product/geprc-storm2-0-4s-850-2000mah-150c-lipo-battery/?attribute_capacity=850mAh",
  "gnb-1s-550-100c-a30": "https://www.racedayquads.com/products/gaoneng-gnb-3-8v-1s-550mah-100c-lihv-whoop-micro-battery-w-plastic-head-a30",
  "iflight-fullsend-6s-1550-150c": "https://shop.iflight.com/batteries-cat138/iFlight-Fullsend-6S-1550mAh-150C-Battery-Pro2411",
  "ovonic-6s-1300-100c": "https://www.ovonicshop.com/products/ovonic-1300mah-6s-22-2v-100c-lipo-battery-with-xt60-for-fpv",
  "smc-hcl-rs-6s-1400": "https://www.smc-racing.com/index.php?order=ASC&path=67_119&product_id=856&route=product%2Fproduct&sort=pd.name",
  "tattu-1s-300-75c-bt2": "https://gensace.de/products/tattu-300mah-3-8v-75c-1s1p-hv-lipo-battery-pack-with-bt-2-0-plug-2401",
  "tattu-rline-v6-6s-1300-st": "https://www.tattuworld.com/products/tattu-r-line-6-0-1300mah-6s1p-22-2v-160c-st-fpv-lipo-battery.html",
};

function decode(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&#x2F;/g, "/").replace(/&quot;/g, '"');
}

function ogImage(html: string): string | null {
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["']/i.test(tag)) continue;
    const match = tag.match(/content=["']([^"']+)["']/i);
    if (match) return decode(match[1]);
  }
  return null;
}

describe("V5 temporary OG resolver", () => {
  it("resolves source pages for recommendation-visible products", async () => {
    const products = getProducts();
    const rows = await Promise.all(ids.map(async (id) => {
      const product = products.find((candidate) => candidate.id === id)!;
      const url = sourceOverrides[id] ?? product.productUrl ?? "";
      if (!url) return { id, url, image: null, status: 0 };
      try {
        const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(12_000), redirect: "follow" });
        const html = await response.text();
        return { id, url, image: ogImage(html), status: response.status };
      } catch (error) {
        return { id, url, image: null, status: -1, error: String(error) };
      }
    }));
    console.log("V5_OG_ASSETS=" + JSON.stringify(rows));
    expect(rows.length).toBe(ids.length);
  }, 120_000);
});
