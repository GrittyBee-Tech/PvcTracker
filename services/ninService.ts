export async function verifyNIN(id_number: string) {
  try {
    const apiKey = process.env.LUMIID_SECRET_KEY;
    console.log("KEY EXISTS:", apiKey);
    console.log(id_number);

    // const response = await fetch("https://api.lumiid.com/v1/ng/nin-basic/", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ nin: id_number }),
    // });

    // console.log("STATUS:", response.status);

    // const text = await response.text();
    // console.log("BODY:", text);

    // return JSON.parse(text);
    return {
      success: true,
      code: "NIN_VERIFIED",
      message: "NIN verification successful",
      verification_type: "NIN",
      summary: {
        verified: true,
        verification_type: "NIN",
        provider: "LumiID",
        confidence_score: 1.0,
      },
      data: {
        nin: "89184072280",
        firstname: "TERHEMBA",
        lastname: "JUDE",
        middlename: "",
        phone: "08000000000",
        gender: "m",
        birthdate: "06-01-1974",
        photo: "/9j/4AAQSkZJRgABAgAAAQABAAD...",
        residence: {
          address1: "8637 Larkin Ports",
          town: "Abuja",
          lga: "Abuja Municipal",
          state: "FCT Abuja",
        },
      },
    };
  } catch (error) {
    console.error("LUMIID FETCH ERROR:", error);
    throw error;
  }
}
