"""
Generate a choropleth map of SF Mandarin Immersion K-8 interest by neighborhood.

Pulls DataSF Analysis Neighborhoods (41-nhood set), joins your family counts,
renders a PNG.

Usage:
    python3 neighborhood-map.py

Outputs:
    sf-interest-map.png  (next to this script)
"""

import io
import pathlib
import urllib.request

import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.cm import ScalarMappable
from matplotlib.colors import Normalize

# --- Data ---

COUNTS = {
    "Sunset/Parkside": 94,
    "West of Twin Peaks": 82,
    "Inner Sunset": 38,
    "Outer Richmond": 37,
    "Bernal Heights": 35,
    "Noe Valley": 32,
    "Mission": 30,
    "Oceanview/Merced/Ingleside": 29,
    "Haight Ashbury": 22,
    "Lone Mountain/USF": 21,
    "Castro/Upper Market": 20,
    "Glen Park": 18,
    "Mission Bay": 17,
    "Excelsior": 17,
    "Pacific Heights": 15,
    "Russian Hill": 14,
    "Inner Richmond": 14,
    "Bayview Hunters Point": 14,
    "Potrero Hill": 13,
    "Portola": 13,
    "Outer Mission": 12,
    "Presidio": 11,
    "Visitacion Valley": 9,
    "South of Market": 9,
    "Nob Hill": 9,
    "Hayes Valley": 7,
    "Presidio Heights": 6,
    "Western Addition": 5,
    "Financial District/South Beach": 4,
    "North Beach": 3,
    "Twin Peaks": 2,
    "Tenderloin": 1,
    "Seacliff": 1,
    "Japantown": 1,
    "Golden Gate Park": 1,
    "Chinatown": 1,
}

GEOJSON_URL = "https://data.sfgov.org/resource/j2bu-swwd.geojson?$limit=100"
OUT = pathlib.Path(__file__).parent / "sf-interest-map.png"


def main() -> None:
    print("Downloading SF Analysis Neighborhoods from DataSF...")
    with urllib.request.urlopen(GEOJSON_URL) as resp:
        nhoods = gpd.read_file(io.BytesIO(resp.read()))

    print(f"Loaded {len(nhoods)} neighborhoods.")

    counts_df = pd.DataFrame(
        [(k, v) for k, v in COUNTS.items()], columns=["nhood", "families"]
    )
    merged = nhoods.merge(counts_df, on="nhood", how="left")
    merged["families"] = merged["families"].fillna(0)

    unmatched = set(COUNTS) - set(nhoods["nhood"])
    if unmatched:
        print(f"WARNING — names in your data not found in DataSF: {sorted(unmatched)}")

    fig, ax = plt.subplots(figsize=(14, 14))

    max_count = merged["families"].max()

    merged.plot(
        column="families",
        ax=ax,
        cmap="Blues",
        linewidth=0.6,
        edgecolor="white",
        legend=False,
        missing_kwds={"color": "#f0f0f0", "edgecolor": "white", "label": "No data"},
    )

    # Colorbar at the top (in the empty water space above the city).
    norm = Normalize(vmin=0, vmax=max_count)
    sm = ScalarMappable(norm=norm, cmap="Blues")
    sm.set_array([])
    cax = fig.add_axes([0.25, 0.88, 0.5, 0.025])  # [left, bottom, width, height]
    cbar = fig.colorbar(sm, cax=cax, orientation="horizontal")
    cbar.set_label("Interested families", fontsize=18)
    cbar.ax.tick_params(labelsize=15)

    display_names = {
        "Financial District/South Beach": "FiDi/South Beach",
        "Western Addition": "Western\nAddition",
        "Castro/Upper Market": "Castro/\nUpper Market",
    }
    # Neighborhoods where the count should appear ABOVE the name.
    count_first = {"Western Addition", "Financial District/South Beach"}
    # Manual label nudges in map coordinates (degrees).
    label_nudge = {
        "Western Addition": (0, -0.004),
    }

    for _, row in merged.iterrows():
        n = int(row["families"])
        pt = row.geometry.representative_point()
        raw = row["nhood"]
        dx, dy = label_nudge.get(raw, (0, 0))
        name = display_names.get(raw, raw)
        # Dark label on light fills, white label on dark fills.
        label_color = "white" if n / max_count > 0.55 else "#1f1f1f"
        if n == 0:
            label = name
        elif raw in count_first:
            label = f"{n}\n{name}"
        else:
            label = f"{name}\n{n}"
        ax.annotate(
            label,
            xy=(pt.x + dx, pt.y + dy),
            ha="center",
            va="center",
            fontsize=13,
            color=label_color,
            weight="bold" if n > 0 else "normal",
            linespacing=1.15,
        )

    ax.text(
        0.5,
        0.02,
        f"Total: {sum(COUNTS.values())} families • Source: sfmandarinschool.org interest form",
        transform=ax.transAxes,
        ha="center",
        fontsize=18,
        color="#666",
    )
    ax.text(
        0.5,
        -0.005,
        "Note: some families did not disclose address",
        transform=ax.transAxes,
        ha="center",
        fontsize=15,
        color="#888",
        style="italic",
    )
    ax.set_axis_off()

    plt.tight_layout()
    plt.savefig(OUT, dpi=200, bbox_inches="tight", facecolor="white")
    print(f"Saved → {OUT}")


if __name__ == "__main__":
    main()
