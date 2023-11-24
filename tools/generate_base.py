import pandas as pd


def generate_md_from_summary(df: pd.DataFrame, title_column: str = 'name') -> str:
    """
    Generate base md files for all mps

    :param df: dataframe of mp info
    :param title_column: name oclumn to use for titling md files
    :return:
    """
    cols = df.columns
    base_cols = ['contact', 'name', 'parliamentary_office_phone_number', 'parliamentary_office_email', 'party',
                 'borough']

    def create_base_md(contact, name, phone, email, party, borough):
        return """## <a href="{}">{}</a>

Parliamentary phone number: {} \n
Parliamentary email: {} \n
Party: {} \n
Borough: {} \n
""".format(contact, name, phone, email, party, borough)

    def beautify(text):
        return text.replace("_", " ").capitalize()

    for index, row in df.iterrows():
        base_md = create_base_md(*[row[col] for col in base_cols])
        extra_info = ''
        for col in cols:
            if col not in base_cols and col != 'Unnamed: 0':
                extra_info += "<li>" + beautify(col)
                extra_info = extra_info + ": " + str(row[col])
                extra_info = extra_info.strip() + "</li>\n"

        base_md = base_md + """<details><summary>Extra contact information and social media</summary> \n{}</details>""".format(
            extra_info)

        with open("../youcanthide/reports/individuals/" + row[title_column] + ".md", "w") as text_file:
            text_file.write(base_md)


if __name__ == "__main__":
    mps_info = pd.read_csv('./data/mps_with_contact_20231107.csv')
    generate_md_from_summary(mps_info)
