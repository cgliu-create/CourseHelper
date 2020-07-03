# Generated by Django 3.0.7 on 2020-07-03 17:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=64)),
            ],
            options={
                'verbose_name_plural': '4. Categories',
            },
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course', models.CharField(max_length=64)),
                ('credit', models.IntegerField(default=1)),
            ],
            options={
                'verbose_name_plural': '7. Courses',
            },
        ),
        migrations.CreateModel(
            name='Enrolled',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enrolled', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name_plural': '2. Enrolled',
            },
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('firstname', models.CharField(max_length=64)),
                ('lastname', models.CharField(max_length=64)),
                ('username', models.CharField(max_length=64)),
            ],
            options={
                'verbose_name_plural': '1. Students',
            },
        ),
        migrations.CreateModel(
            name='SubCategory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subcategory', models.CharField(max_length=64)),
                ('note', models.TextField()),
                ('categories', models.ManyToManyField(related_name='subcategories', to='courses.Category')),
            ],
            options={
                'verbose_name_plural': '5. Sub Categories',
            },
        ),
        migrations.CreateModel(
            name='Requirement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('requirement', models.CharField(max_length=64)),
                ('credit', models.IntegerField(default=1)),
                ('subcategories', models.ManyToManyField(related_name='requirements', to='courses.SubCategory')),
            ],
            options={
                'verbose_name_plural': '6. Requirements',
            },
        ),
        migrations.CreateModel(
            name='Prereq',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prereq', models.CharField(max_length=64)),
                ('courses', models.ManyToManyField(blank=True, related_name='prereqs', to='courses.Course')),
            ],
            options={
                'verbose_name_plural': '8. Prereqs',
            },
        ),
        migrations.CreateModel(
            name='Major',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('major', models.CharField(max_length=64)),
                ('enrolled', models.ManyToManyField(related_name='majors', to='courses.Enrolled')),
            ],
            options={
                'verbose_name_plural': '3. Majors',
            },
        ),
        migrations.AddField(
            model_name='enrolled',
            name='students',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrolled', to='courses.Student'),
        ),
        migrations.AddField(
            model_name='course',
            name='requirements',
            field=models.ManyToManyField(related_name='courses', to='courses.Requirement'),
        ),
        migrations.AddField(
            model_name='category',
            name='major',
            field=models.ManyToManyField(related_name='categories', to='courses.Major'),
        ),
        migrations.CreateModel(
            name='ApCredit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('test', models.CharField(max_length=64)),
                ('scoremin', models.IntegerField(default=3)),
                ('scoremax', models.IntegerField(default=3)),
                ('courses', models.ManyToManyField(blank=True, related_name='apcredits', to='courses.Course')),
            ],
            options={
                'verbose_name_plural': '9. ApCredit',
            },
        ),
    ]
