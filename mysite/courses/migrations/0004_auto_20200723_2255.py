# Generated by Django 3.0.7 on 2020-07-23 22:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_auto_20200708_1816'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='apcredit',
            options={'verbose_name_plural': '9. Helper ApCredit'},
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'verbose_name_plural': '4. Helper Categories'},
        ),
        migrations.AlterModelOptions(
            name='course',
            options={'verbose_name_plural': '7. Helper Courses'},
        ),
        migrations.AlterModelOptions(
            name='enrolled',
            options={'verbose_name_plural': '2. Helper Enrolled'},
        ),
        migrations.AlterModelOptions(
            name='major',
            options={'verbose_name_plural': '3. Helper Majors'},
        ),
        migrations.AlterModelOptions(
            name='prereq',
            options={'verbose_name_plural': '8. Helper Prereqs'},
        ),
        migrations.AlterModelOptions(
            name='requirement',
            options={'verbose_name_plural': '6. Helper Requirements'},
        ),
        migrations.AlterModelOptions(
            name='student',
            options={'verbose_name_plural': '1. Helper Students'},
        ),
        migrations.AlterModelOptions(
            name='subcategory',
            options={'verbose_name_plural': '5. Helper Sub Categories'},
        ),
    ]
