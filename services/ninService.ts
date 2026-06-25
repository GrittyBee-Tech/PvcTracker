export async function verifyNIN(id_number: string) {
  try {
    const apiKey = process.env.LUMIID_SECRET_KEY;

    const response = await fetch("https://api.lumiid.com/v1/ng/nin-basic/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nin: id_number }),
    });

    const data = await response.json();
    console.info("BODY:", data);
    return data;
  } catch (error) {
    console.error("LUMIID FETCH ERROR:", error);
    throw error;
  }
}
